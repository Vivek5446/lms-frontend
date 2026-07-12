"use client";

import {
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Icon,
  SimpleGrid,
  Text,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  Switch,
  HStack,
  IconButton,
  useColorModeValue,
  useToast,
  Badge,
  Collapse,
  Divider,
  Tooltip,
  Spinner
} from "@chakra-ui/react";
import { useState } from "react";
import { FaClipboardList, FaPlus, FaTrash, FaEdit, FaChevronDown, FaChevronUp, FaLightbulb, FaArrowUp, FaArrowDown, FaLink, FaMagic, FaRobot } from "react-icons/fa";
import { FiCheckCircle, FiStar, FiImage, FiVideo, FiList, FiGrid } from "react-icons/fi";
import axios from "axios";

export default function QuestionBuilder({ quizId, initialQuestions = [] }: { quizId: string, initialQuestions?: any[] }) {
  const toast = useToast();
  const [questions, setQuestions] = useState<any[]>(initialQuestions);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [isSavingQuestion, setIsSavingQuestion] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Form State
  const [questionText, setQuestionText] = useState("");
  const [questionType, setQuestionType] = useState("text"); 
  const [points, setPoints] = useState(1);
  const [options, setOptions] = useState([{ answer: "", correct: false, sequenceOrder: 1, description: "" }, { answer: "", correct: false, sequenceOrder: 2, description: "" }]);
  
  // Advanced Features State
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [difficultyLevel, setDifficultyLevel] = useState("Medium");
  const [negativePoints, setNegativePoints] = useState(0);
  const [allowPartialCredit, setAllowPartialCredit] = useState(false);
  const [explanation, setExplanation] = useState("");

  const cardBg = useColorModeValue("rgba(255, 255, 255, 0.9)", "rgba(26, 32, 44, 0.9)");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const headingColor = useColorModeValue("gray.900", "white");
  const secondaryTextColor = useColorModeValue("gray.500", "gray.400");
  
  const getDifficultyColor = (level: string) => {
    if (level === "Easy") return "green";
    if (level === "Medium") return "yellow";
    if (level === "Hard") return "red";
    return "gray";
  };

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case "image": return FiImage;
      case "video": return FiVideo;
      case "sequence": return FiList;
      case "matrix": return FiGrid;
      default: return FiStar;
    }
  };

  const handleDeleteQuestion = async (qId: string) => {
    if (!confirm("Are you sure you want to permanently delete this question?")) return;
    try {
      await axios.delete(`/quiz/${quizId}/questions/${qId}`);
      setQuestions(questions.filter(q => q._id !== qId));
      toast({ title: "Question deleted", status: "success" });
    } catch (error: any) {
      toast({ title: "Failed to delete question", status: "error" });
    }
  };

  // Option Handlers
  const handleAddOption = () => {
    setOptions([...options, { answer: "", correct: false, sequenceOrder: options.length + 1, description: "" }]);
  };
  
  const handleOptionChange = (index: number, field: string, value: any) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setOptions(newOptions);
  };
  
  const handleRemoveOption = (index: number) => {
    const newOptions = [...options];
    newOptions.splice(index, 1);
    // Re-assign sequence order
    newOptions.forEach((opt, idx) => opt.sequenceOrder = idx + 1);
    setOptions(newOptions);
  };

  const handleMoveOption = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === options.length - 1) return;
    
    const newOptions = [...options];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    
    // Swap items
    const temp = newOptions[index];
    newOptions[index] = newOptions[swapIndex];
    newOptions[swapIndex] = temp;
    
    // Update sequence orders
    newOptions.forEach((opt, idx) => opt.sequenceOrder = idx + 1);
    setOptions(newOptions);
  };

  const handleEditQuestion = (q: any) => {
    setEditingQuestionId(q._id);
    setQuestionText(q.question);
    setQuestionType(q.questionType || "text");
    setPoints(q.points || 1);
    setOptions(q.answers?.length > 0 ? q.answers : [{ answer: "", correct: false, sequenceOrder: 1, description: "" }]);
    
    setDifficultyLevel(q.difficultyLevel || "Medium");
    setNegativePoints(q.negativePoints || 0);
    setAllowPartialCredit(q.allowPartialCredit || false);
    setExplanation(q.explanation || "");
    
    setIsAddingQuestion(true);
    setShowAdvanced(!!q.explanation || q.negativePoints > 0 || q.allowPartialCredit);
  };

  const resetQuestionForm = () => {
    setQuestionText("");
    setQuestionType("text");
    setPoints(1);
    setOptions([{ answer: "", correct: false, sequenceOrder: 1, description: "" }, { answer: "", correct: false, sequenceOrder: 2, description: "" }]);
    
    setDifficultyLevel("Medium");
    setNegativePoints(0);
    setAllowPartialCredit(false);
    setExplanation("");
    setShowAdvanced(false);

    setIsAddingQuestion(false);
    setEditingQuestionId(null);
  };

  const handleSaveQuestion = async () => {
    if (!questionText) {
      toast({ title: "Question prompt is required.", status: "warning" });
      return;
    }

    setIsSavingQuestion(true);
    try {
      const payload = {
        question: questionText,
        questionType,
        points,
        answers: options,
        difficultyLevel,
        negativePoints,
        allowPartialCredit,
        explanation
      };

      let response;
      if (editingQuestionId) {
        response = await axios.put(`/quiz/${quizId}/questions/${editingQuestionId}`, payload);
        setQuestions(questions.map(q => q._id === editingQuestionId ? response.data.data : q));
        toast({ title: "Question Updated", status: "success" });
      } else {
        response = await axios.post(`/quiz/${quizId}/questions`, payload);
        setQuestions([...questions, response.data.data]);
        toast({ title: "Question Created", status: "success" });
      }
      
      resetQuestionForm();
    } catch (error: any) {
      toast({ title: "Failed to save question", status: "error" });
    } finally {
      setIsSavingQuestion(false);
    }
  };

  const handleAIGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      toast({ title: "AI Generation simulated!", description: "In production, this would query OpenAI and populate the list.", status: "success" });
    }, 2000);
  };

  return (
    <Box>
      {/* AI Generator Bar */}
      <Flex 
        mb={8} 
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
            <Text fontSize="sm" opacity={0.9}>Instantly generate perfect questions with AI</Text>
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

      {/* Saved Questions List - Premium Cards */}
      {questions.length > 0 && !isAddingQuestion && (
        <VStack spacing={4} align="stretch" mb={8}>
          <Heading size="md" color={headingColor} mb={2}>Saved Questions</Heading>
          {questions.map((q, idx) => (
            <Box 
              key={q._id || idx} 
              p={5} 
              bg={cardBg} 
              borderWidth="1px" 
              borderColor={borderColor} 
              rounded="xl" 
              shadow="sm"
              transition="all 0.2s"
              _hover={{ shadow: "md", transform: "translateY(-2px)", borderColor: "blue.300" }}
              backdropFilter="blur(10px)"
            >
              <Flex justify="space-between" align="flex-start">
                <Box flex="1" mr={4}>
                  <HStack mb={2} spacing={3}>
                    <Badge colorScheme="blue" rounded="md" px={2} py={1}>Q{idx + 1}</Badge>
                    <Badge colorScheme={getDifficultyColor(q.difficultyLevel)} variant="subtle" rounded="md">{q.difficultyLevel || "Medium"}</Badge>
                    <Badge colorScheme="purple" variant="outline" rounded="md">{q.points} Points</Badge>
                    <Badge colorScheme="gray" variant="solid" rounded="md"><Icon as={getQuestionTypeIcon(q.questionType)} mr={1} mb="-2px"/>{q.questionType}</Badge>
                    {q.negativePoints > 0 && (
                      <Badge colorScheme="red" variant="outline" rounded="md">-{q.negativePoints} Penalty</Badge>
                    )}
                  </HStack>
                  <Text fontWeight="semibold" fontSize="lg" color={headingColor} noOfLines={2}>
                    {q.questionType === "image" || q.questionType === "video" ? <><Icon as={FaLink} mr={2} color="blue.400"/> {q.question}</> : q.question}
                  </Text>
                  {q.explanation && (
                    <Text fontSize="sm" color={secondaryTextColor} mt={2} fontStyle="italic" noOfLines={1}>
                      <Icon as={FaLightbulb} mr={1} color="yellow.400" /> {q.explanation}
                    </Text>
                  )}
                </Box>
                <HStack spacing={1}>
                  <Tooltip label="Edit Question">
                    <IconButton aria-label="Edit question" icon={<FaEdit />} colorScheme="blue" variant="ghost" onClick={() => handleEditQuestion(q)} />
                  </Tooltip>
                  <Tooltip label="Delete Question">
                    <IconButton aria-label="Delete question" icon={<FaTrash />} colorScheme="red" variant="ghost" onClick={() => handleDeleteQuestion(q._id)} />
                  </Tooltip>
                </HStack>
              </Flex>
            </Box>
          ))}
        </VStack>
      )}

      {/* Empty State / Add Button */}
      {!isAddingQuestion ? (
        <Center 
          flexDirection="column" 
          py={12} 
          textAlign="center" 
          bg={cardBg}
          borderWidth="2px" 
          borderStyle="dashed" 
          borderColor={borderColor} 
          rounded="2xl"
          cursor="pointer"
          transition="all 0.2s"
          _hover={{ bg: useColorModeValue("blue.50", "blue.900"), borderColor: "blue.400" }}
          onClick={() => setIsAddingQuestion(true)}
        >
          <Icon as={FaPlus} boxSize={10} color="blue.400" mb={4} />
          <Heading size="md" color={headingColor} mb={2}>
            {questions.length === 0 ? "Start Building Your Assessment" : "Add Another Question"}
          </Heading>
          <Text color={secondaryTextColor} maxW="md">
            Create powerful, dynamic questions using the premium builder.
          </Text>
        </Center>
      ) : (
        /* Premium Question Builder Form */
        <Box bg={cardBg} borderWidth="1px" borderColor={borderColor} rounded="2xl" p={8} shadow="lg" backdropFilter="blur(10px)">
          <VStack spacing={8} align="stretch">
            <Flex justify="space-between" align="center">
              <HStack>
                <Icon as={FiStar} color="blue.500" boxSize={6} />
                <Heading size="md" color={headingColor}>{editingQuestionId ? "Edit Advanced Question" : "Create Advanced Question"}</Heading>
              </HStack>
              <Button variant="ghost" colorScheme="red" onClick={resetQuestionForm}>Cancel</Button>
            </Flex>
            
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
              <FormControl isRequired>
                <FormLabel color={secondaryTextColor}>Question Engine Type</FormLabel>
                <Select value={questionType} onChange={(e) => setQuestionType(e.target.value)} rounded="md" focusBorderColor="blue.400" bg="blue.50" color="blue.700" fontWeight="bold">
                  <option value="text">Standard Multiple Choice</option>
                  <option value="fill_in_blanks">Fill in the Blanks</option>
                  <option value="sequence">Sequence (Drag & Drop Ordering)</option>
                  <option value="matrix">Matrix (Match the Following)</option>
                  <option value="image">Image Prompt</option>
                  <option value="video">Video Prompt</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel color={secondaryTextColor}>Difficulty Level</FormLabel>
                <Select value={difficultyLevel} onChange={(e) => setDifficultyLevel(e.target.value)} rounded="md" focusBorderColor="blue.400">
                  <option value="Easy">Easy (Green)</option>
                  <option value="Medium">Medium (Yellow)</option>
                  <option value="Hard">Hard (Red)</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel color={secondaryTextColor}>Points</FormLabel>
                <Input type="number" value={points} onChange={(e) => setPoints(Number(e.target.value))} rounded="md" focusBorderColor="blue.400" />
              </FormControl>
            </SimpleGrid>

            <FormControl isRequired>
              <FormLabel color={secondaryTextColor} fontWeight="bold">
                {questionType === "image" ? "Image URL" : questionType === "video" ? "Video URL" : "Question Prompt"}
              </FormLabel>
              <Textarea 
                value={questionText} 
                onChange={(e) => setQuestionText(e.target.value)} 
                placeholder={
                  questionType === "fill_in_blanks" ? "Use [blank] to indicate where the student should fill in text. E.g. The capital of France is [blank]." 
                  : questionType === "image" ? "https://example.com/image.png"
                  : questionType === "video" ? "https://youtube.com/watch?v=..."
                  : "Write your brilliant question here..."
                }
                rows={4} 
                size="lg"
                focusBorderColor="blue.400"
                rounded="xl"
              />
              {questionType === "fill_in_blanks" && (
                <Text fontSize="sm" color="blue.500" mt={2}><Icon as={FaLightbulb} mr={1}/> Hint: Add options below to represent the correct answers for each [blank] in order.</Text>
              )}
            </FormControl>

            {/* Dynamic Options Section based on Type */}
            <Box borderWidth="1px" borderColor={borderColor} p={6} rounded="xl" bg={useColorModeValue("gray.50", "gray.800")}>
              <Heading size="sm" mb={6} color={headingColor} textTransform="uppercase" letterSpacing="widest">
                {questionType === "sequence" ? "Define Correct Order" : questionType === "matrix" ? "Define Matching Pairs" : "Answer Options"}
              </Heading>
              
              <VStack spacing={4} align="stretch">
                {options.map((opt, idx) => (
                  <HStack w="100%" key={idx} bg={cardBg} p={3} rounded="lg" shadow="sm" borderWidth="1px" borderColor={opt.correct && questionType === "text" ? "green.400" : borderColor}>
                    
                    {/* Sequence Badges */}
                    {questionType === "sequence" ? (
                      <Badge colorScheme="blue" px={3} py={2} rounded="md" fontSize="md">Step {opt.sequenceOrder}</Badge>
                    ) : (
                      <Badge colorScheme="gray" px={2} py={1} rounded="md">{String.fromCharCode(65 + idx)}</Badge>
                    )}

                    {/* Primary Input */}
                    <Input 
                      placeholder={questionType === "matrix" ? `Prompt A${idx + 1} (Left Side)` : `Option ${idx + 1}`} 
                      value={opt.answer} 
                      onChange={(e) => handleOptionChange(idx, "answer", e.target.value)} 
                      variant="unstyled"
                      px={2}
                      fontWeight="medium"
                    />

                    {/* Secondary Input for Matrix Match */}
                    {questionType === "matrix" && (
                      <>
                        <Icon as={FiCheckCircle} color="green.400" mx={2} />
                        <Input 
                          placeholder={`Match B${idx + 1} (Right Side)`} 
                          value={opt.description} 
                          onChange={(e) => handleOptionChange(idx, "description", e.target.value)} 
                          variant="unstyled"
                          px={2}
                          fontWeight="medium"
                          borderLeftWidth="1px"
                          borderColor={borderColor}
                          pl={4}
                        />
                      </>
                    )}

                    {/* Standard Text/Image/Video Options */}
                    {(questionType === "text" || questionType === "image" || questionType === "video") && (
                      <FormControl display="flex" alignItems="center" w="auto" mr={2}>
                        <FormLabel mb="0" whiteSpace="nowrap" color={opt.correct ? "green.500" : secondaryTextColor} fontSize="sm" fontWeight={opt.correct ? "bold" : "normal"}>
                          {opt.correct ? "Correct Answer" : "Mark Correct"}
                        </FormLabel>
                        <Switch colorScheme="green" isChecked={opt.correct} onChange={(e) => handleOptionChange(idx, "correct", e.target.checked)} />
                      </FormControl>
                    )}

                    {/* Sequence Controls */}
                    {questionType === "sequence" && (
                      <HStack spacing={1} mr={2}>
                        <IconButton aria-label="Move Up" icon={<FaArrowUp />} size="sm" variant="ghost" onClick={() => handleMoveOption(idx, "up")} isDisabled={idx === 0} />
                        <IconButton aria-label="Move Down" icon={<FaArrowDown />} size="sm" variant="ghost" onClick={() => handleMoveOption(idx, "down")} isDisabled={idx === options.length - 1} />
                      </HStack>
                    )}

                    <IconButton aria-label="Remove" icon={<FaTrash />} colorScheme="red" variant="ghost" size="sm" onClick={() => handleRemoveOption(idx)} />
                  </HStack>
                ))}
                <Button size="md" leftIcon={<FaPlus />} variant="outline" colorScheme="blue" alignSelf="center" mt={2} onClick={handleAddOption} borderStyle="dashed">
                  {questionType === "matrix" ? "Add Pair" : questionType === "sequence" ? "Add Sequence Step" : "Add Another Option"}
                </Button>
              </VStack>
            </Box>

            {/* Advanced Settings Toggle */}
            <Box>
              <Button 
                variant="ghost" 
                colorScheme="blue" 
                rightIcon={showAdvanced ? <FaChevronUp /> : <FaChevronDown />} 
                onClick={() => setShowAdvanced(!showAdvanced)}
                size="sm"
              >
                {showAdvanced ? "Hide Advanced Scoring & Settings" : "Show Advanced Scoring & Settings"}
              </Button>
              <Collapse in={showAdvanced} animateOpacity>
                <Box p={6} mt={4} borderWidth="1px" borderColor={borderColor} rounded="xl" bg={useColorModeValue("blue.50", "blue.900")}>
                  <VStack spacing={6} align="stretch">
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                      <FormControl>
                        <FormLabel color={secondaryTextColor} fontWeight="semibold">Negative Points (Penalty)</FormLabel>
                        <Input type="number" value={negativePoints} onChange={(e) => setNegativePoints(Number(e.target.value))} bg={cardBg} />
                        <Text fontSize="xs" color="gray.500" mt={1}>Points deducted for a wrong answer.</Text>
                      </FormControl>
                      <FormControl display="flex" flexDirection="column" justifyContent="center">
                        <FormLabel color={secondaryTextColor} fontWeight="semibold">Partial Credit</FormLabel>
                        <Switch colorScheme="blue" size="lg" isChecked={allowPartialCredit} onChange={(e) => setAllowPartialCredit(e.target.checked)} />
                        <Text fontSize="xs" color="gray.500" mt={1}>Allow points for selecting some correct answers in MSQ.</Text>
                      </FormControl>
                    </SimpleGrid>
                    
                    <Divider borderColor={borderColor} />
                    
                    <FormControl>
                      <FormLabel color={secondaryTextColor} fontWeight="semibold">Post-Grading Explanation</FormLabel>
                      <Textarea 
                        value={explanation} 
                        onChange={(e) => setExplanation(e.target.value)} 
                        placeholder="Explain why the answer is correct. This is shown to students after they submit the quiz." 
                        rows={3} 
                        bg={cardBg}
                      />
                    </FormControl>
                  </VStack>
                </Box>
              </Collapse>
            </Box>

            <Flex justify="flex-end" pt={6}>
              <Button colorScheme="blue" size="lg" leftIcon={<FiCheckCircle />} onClick={handleSaveQuestion} isLoading={isSavingQuestion} shadow="md" _hover={{ transform: "translateY(-1px)", shadow: "lg" }}>
                {editingQuestionId ? "Update Advanced Question" : "Save Advanced Question"}
              </Button>
            </Flex>
          </VStack>
        </Box>
      )}
    </Box>
  );
}
