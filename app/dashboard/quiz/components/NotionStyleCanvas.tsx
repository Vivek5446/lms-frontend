"use client";

import {
  Box,
  Flex,
  Heading,
  Icon,
  Text,
  VStack,
  HStack,
  IconButton,
  useColorModeValue,
  useToast,
  Input,
  Button,
  Textarea,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Divider,
  Spinner,
  Badge
} from "@chakra-ui/react";
import { useState, useRef, useEffect } from "react";
import { FaPlus, FaTrash, FaRobot, FaMagic, FaCheckCircle, FaList, FaImage, FaGripVertical } from "react-icons/fa";
import axios from "axios";

// Represents a block in our Notion-style canvas
type BlockType = "text" | "mcq" | "sequence" | "matrix" | "image";

interface Block {
  id: string;
  type: BlockType;
  content: string;
  options?: any[];
  isSaved?: boolean;
  databaseId?: string;
}

export default function NotionStyleCanvas({ quizId, initialQuestions = [] }: { quizId: string, initialQuestions?: any[] }) {
  const toast = useToast();
  
  // Transform saved questions into Canvas Blocks
  const initialBlocks: Block[] = initialQuestions.map(q => ({
    id: `block-${q._id}`,
    type: q.questionType === "text" ? "mcq" : q.questionType as BlockType,
    content: q.question,
    options: q.answers,
    isSaved: true,
    databaseId: q._id
  }));

  // If empty, start with one empty text block
  const [blocks, setBlocks] = useState<Block[]>(
    initialBlocks.length > 0 ? initialBlocks : [{ id: "block-init", type: "text", content: "" }]
  );
  
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashMenuPosition, setSlashMenuPosition] = useState({ top: 0, left: 0 });
  const [isGenerating, setIsGenerating] = useState(false);

  const canvasBg = useColorModeValue("rgba(255, 255, 255, 0.8)", "rgba(26, 32, 44, 0.8)");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const placeholderColor = useColorModeValue("gray.400", "gray.500");
  const hoverBg = useColorModeValue("rgba(247, 250, 252, 0.8)", "rgba(45, 55, 72, 0.8)");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const handleKeyDown = (e: React.KeyboardEvent, index: number, block: Block) => {
    if (e.key === "/") {
      // Trigger slash command menu
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      setSlashMenuPosition({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX });
      setShowSlashMenu(true);
    } else {
      setShowSlashMenu(false);
    }

    if (e.key === "Enter" && !e.shiftKey && block.type === "text") {
      e.preventDefault();
      const newBlock: Block = { id: `block-${Date.now()}`, type: "text", content: "" };
      const newBlocks = [...blocks];
      newBlocks.splice(index + 1, 0, newBlock);
      setBlocks(newBlocks);
      setTimeout(() => document.getElementById(newBlock.id)?.focus(), 10);
    }

    if (e.key === "Backspace" && block.content === "" && blocks.length > 1) {
      e.preventDefault();
      const newBlocks = [...blocks];
      newBlocks.splice(index, 1);
      setBlocks(newBlocks);
      setTimeout(() => document.getElementById(blocks[index - 1]?.id)?.focus(), 10);
    }
  };

  const transformBlock = (index: number, newType: BlockType) => {
    const newBlocks = [...blocks];
    newBlocks[index].type = newType;
    if (newType !== "text") {
      newBlocks[index].options = [
        { answer: "", correct: false },
        { answer: "", correct: false }
      ];
    }
    setBlocks(newBlocks);
    setShowSlashMenu(false);
  };

  const saveBlockToDatabase = async (index: number) => {
    const block = blocks[index];
    if (!block.content) return;

    try {
      const payload = {
        question: block.content,
        questionType: block.type === "mcq" ? "text" : block.type,
        answers: block.options,
        points: 1
      };

      let res;
      if (block.databaseId) {
        res = await axios.put(`/quiz/${quizId}/questions/${block.databaseId}`, payload);
        toast({ title: "Updated", status: "success", duration: 1000 });
      } else {
        res = await axios.post(`/quiz/${quizId}/questions`, payload);
        toast({ title: "Saved", status: "success", duration: 1000 });
      }

      const newBlocks = [...blocks];
      newBlocks[index].isSaved = true;
      newBlocks[index].databaseId = res.data.data._id;
      setBlocks(newBlocks);
    } catch (err) {
      toast({ title: "Error saving", status: "error" });
    }
  };

  const deleteBlock = async (index: number) => {
    const block = blocks[index];
    if (block.databaseId) {
      if (!confirm("Delete this question from database?")) return;
      await axios.delete(`/quiz/${quizId}/questions/${block.databaseId}`);
    }
    const newBlocks = [...blocks];
    newBlocks.splice(index, 1);
    if (newBlocks.length === 0) {
      newBlocks.push({ id: `block-${Date.now()}`, type: "text", content: "" });
    }
    setBlocks(newBlocks);
  };

  const handleAIGenerate = () => {
    setIsGenerating(true);
    // Simulate AI generation delay
    setTimeout(() => {
      const aiBlocks: Block[] = [
        {
          id: `block-ai-1`,
          type: "mcq",
          content: "What is the virtual DOM in React?",
          options: [
            { answer: "A direct copy of the actual DOM", correct: false },
            { answer: "A lightweight JavaScript representation of the DOM", correct: true },
            { answer: "A new HTML standard", correct: false }
          ]
        },
        {
          id: `block-ai-2`,
          type: "sequence",
          content: "Order the React component lifecycle phases:",
          options: [
            { answer: "Mounting", correct: true, sequenceOrder: 1 },
            { answer: "Updating", correct: true, sequenceOrder: 2 },
            { answer: "Unmounting", correct: true, sequenceOrder: 3 }
          ]
        }
      ];
      setBlocks([...blocks.filter(b => b.content !== "" || b.type !== "text"), ...aiBlocks]);
      setIsGenerating(false);
      toast({ title: "AI Generation Complete! 🪄", status: "success", position: "top" });
    }, 2500);
  };

  return (
    <Box 
      minH="100dvh" 
      bgGradient={useColorModeValue("linear(to-br, blue.50, purple.50)", "linear(to-br, gray.900, blue.900)")}
      p={{ base: 4, md: 8 }}
      rounded="3xl"
    >
      <Box 
        maxW="900px" 
        mx="auto" 
        minH="85vh" 
        bg={canvasBg} 
        p={{ base: 6, md: 16 }} 
        rounded="3xl" 
        shadow="2xl" 
        position="relative"
        backdropFilter="blur(20px)"
        borderWidth="1px"
        borderColor={borderColor}
      >
        
        {/* AI Generator Bar */}
        <Flex 
          mb={12} 
          p={6} 
          bg="linear-gradient(135deg, #FF6B6B 0%, #845EC2 100%)" 
          rounded="2xl" 
          align="center" 
          justify="space-between" 
          shadow="lg"
          transition="transform 0.2s"
          _hover={{ transform: "translateY(-2px)", shadow: "xl" }}
        >
          <HStack color="white" spacing={4}>
            <Box p={3} bg="whiteAlpha.300" rounded="full">
              <Icon as={FaMagic} boxSize={6} />
            </Box>
            <VStack align="start" spacing={0}>
              <Heading size="md" letterSpacing="tight">AI Quiz Architect</Heading>
              <Text fontSize="sm" opacity={0.9}>Instantly generate perfect questions</Text>
            </VStack>
          </HStack>
          <Button 
            size="lg" 
            bg="white" 
            color="#845EC2" 
            leftIcon={isGenerating ? <Spinner size="sm"/> : <FaRobot />}
            onClick={handleAIGenerate}
            isLoading={isGenerating}
            loadingText="Generating..."
            shadow="md"
            _hover={{ bg: "gray.100" }}
          >
            Auto-Generate
          </Button>
        </Flex>

        {/* The Canvas */}
        <VStack align="stretch" spacing={4}>
        {blocks.map((block, idx) => (
          <Box 
            key={block.id}
            position="relative"
            role="group"
            onMouseEnter={() => setFocusedBlockId(block.id)}
            onMouseLeave={() => setFocusedBlockId(null)}
          >
            {/* Block Controls (Hover) */}
            <HStack 
              position="absolute" 
              left="-40px" 
              top="10px" 
              opacity={focusedBlockId === block.id ? 1 : 0} 
              transition="opacity 0.2s"
            >
              <Icon as={FaPlus} color="gray.400" cursor="pointer" onClick={() => {
                const newBlocks = [...blocks];
                newBlocks.splice(idx + 1, 0, { id: `block-${Date.now()}`, type: "text", content: "" });
                setBlocks(newBlocks);
              }} />
              <Icon as={FaGripVertical} color="gray.400" cursor="grab" />
            </HStack>

            {/* Block Content */}
            <Box pl={2} borderLeftWidth={block.type !== "text" ? "2px" : "0px"} borderColor={block.isSaved ? "green.400" : "blue.400"} py={2}>
              
              {block.type === "text" && (
                <Textarea
                  id={block.id}
                  value={block.content}
                  onChange={(e) => {
                    const newBlocks = [...blocks];
                    newBlocks[idx].content = e.target.value;
                    setBlocks(newBlocks);
                  }}
                  onKeyDown={(e) => handleKeyDown(e, idx, block)}
                  placeholder="Type '/' for commands or write your question..."
                  variant="unstyled"
                  fontSize="lg"
                  color={textColor}
                  _placeholder={{ color: placeholderColor }}
                  resize="none"
                  minH="30px"
                  overflow="hidden"
                  rows={1}
                />
              )}

              {block.type !== "text" && (
                <Box 
                  bg={hoverBg} 
                  p={6} 
                  rounded="2xl" 
                  shadow="sm"
                  borderWidth="1px"
                  borderColor={useColorModeValue("gray.100", "gray.700")}
                  transition="all 0.2s"
                  _hover={{ shadow: "md", borderColor: "blue.300" }}
                >
                  <HStack justify="space-between" mb={4}>
                    <Badge colorScheme="blue" variant="solid" rounded="full" px={3} py={1} fontSize="xs" letterSpacing="widest">
                      {block.type} Question
                    </Badge>
                    <HStack>
                      <Button size="xs" colorScheme="green" variant={block.isSaved ? "solid" : "outline"} onClick={() => saveBlockToDatabase(idx)}>
                        {block.isSaved ? "Saved" : "Save to DB"}
                      </Button>
                      <IconButton aria-label="Delete" icon={<FaTrash />} size="xs" colorScheme="red" variant="ghost" onClick={() => deleteBlock(idx)} />
                    </HStack>
                  </HStack>
                  
                  <Input 
                    value={block.content}
                    onChange={(e) => {
                      const newBlocks = [...blocks];
                      newBlocks[idx].content = e.target.value;
                      newBlocks[idx].isSaved = false;
                      setBlocks(newBlocks);
                    }}
                    placeholder="Enter question prompt..."
                    variant="unstyled"
                    fontSize="2xl"
                    fontWeight="black"
                    letterSpacing="tight"
                    color={textColor}
                    mb={6}
                  />

                  {/* Inline Options Rendering */}
                  <VStack align="stretch" spacing={3}>
                    {block.options?.map((opt, optIdx) => (
                      <HStack 
                        key={optIdx}
                        bg={useColorModeValue("white", "gray.700")}
                        p={3}
                        rounded="xl"
                        borderWidth="1px"
                        borderColor={opt.correct ? "green.400" : borderColor}
                        shadow="sm"
                      >
                        <Icon as={block.type === "mcq" ? (opt.correct ? FaCheckCircle : FaCheckCircle) : FaList} color={opt.correct ? "green.400" : "gray.300"} boxSize={5} cursor="pointer" onClick={() => {
                          const newBlocks = [...blocks];
                          newBlocks[idx].options![optIdx].correct = !newBlocks[idx].options![optIdx].correct;
                          newBlocks[idx].isSaved = false;
                          setBlocks(newBlocks);
                        }}/>
                        <Input 
                          value={opt.answer}
                          onChange={(e) => {
                            const newBlocks = [...blocks];
                            newBlocks[idx].options![optIdx].answer = e.target.value;
                            newBlocks[idx].isSaved = false;
                            setBlocks(newBlocks);
                          }}
                          placeholder={`Option ${optIdx + 1}`}
                          variant="unstyled"
                          fontSize="md"
                          fontWeight="medium"
                          ml={2}
                        />
                      </HStack>
                    ))}
                    <Button size="sm" variant="ghost" colorScheme="blue" alignSelf="flex-start" mt={2} onClick={() => {
                      const newBlocks = [...blocks];
                      newBlocks[idx].options?.push({ answer: "", correct: false });
                      setBlocks(newBlocks);
                    }}>
                      + Add Another Option
                    </Button>
                  </VStack>
                </Box>
              )}
            </Box>
          </Box>
        ))}
      </VStack>

      {/* Floating Slash Menu Overlay */}
      {showSlashMenu && (
        <Box 
          position="absolute" 
          top={`${slashMenuPosition.top - 200}px`} 
          left={`${slashMenuPosition.left}px`} 
          bg={canvasBg} 
          shadow="2xl" 
          rounded="xl" 
          borderWidth="1px" 
          borderColor={borderColor}
          zIndex={1000}
          w="250px"
          overflow="hidden"
        >
          <Box p={2} bg="gray.50" borderBottomWidth="1px">
            <Text fontSize="xs" fontWeight="bold" color="gray.500">BASIC BLOCKS</Text>
          </Box>
          <VStack align="stretch" spacing={0}>
            <Button variant="ghost" rounded="none" justifyContent="flex-start" leftIcon={<FaCheckCircle />} onClick={() => transformBlock(blocks.findIndex(b => b.id === focusedBlockId), "mcq")}>
              Multiple Choice
            </Button>
            <Button variant="ghost" rounded="none" justifyContent="flex-start" leftIcon={<FaList />} onClick={() => transformBlock(blocks.findIndex(b => b.id === focusedBlockId), "sequence")}>
              Sequence Ordering
            </Button>
            <Button variant="ghost" rounded="none" justifyContent="flex-start" leftIcon={<FaImage />} onClick={() => transformBlock(blocks.findIndex(b => b.id === focusedBlockId), "image")}>
              Image Prompt
            </Button>
          </VStack>
        </Box>
      )}

      {/* Invisible click target to add new block at bottom */}
      <Box h="200px" onClick={() => {
        if (blocks[blocks.length - 1].content !== "") {
          setBlocks([...blocks, { id: `block-${Date.now()}`, type: "text", content: "" }]);
        }
      }} cursor="text" />
      
      </Box>
    </Box>
  );
}
