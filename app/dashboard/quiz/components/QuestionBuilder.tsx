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
  Spinner,
  Menu,
  MenuButton,
  MenuList,
  MenuItem
} from "@chakra-ui/react";
import { useState } from "react";
import { FaClipboardList, FaPlus, FaTrash, FaEdit, FaChevronDown, FaChevronUp, FaLightbulb, FaArrowUp, FaArrowDown, FaLink, FaMagic, FaRobot } from "react-icons/fa";
import { FiCheckCircle, FiStar, FiImage, FiVideo, FiList, FiGrid, FiArrowLeft } from "react-icons/fi";
import axios from "axios";

export default function QuestionBuilder({ 
  quizId, 
  initialQuestions = [],
  themeColor = "#0078D4",
  quizTitle = "",
  quizDescription = ""
}: { 
  quizId: string, 
  initialQuestions?: any[],
  themeColor?: string,
  quizTitle?: string,
  quizDescription?: string
}) {
  const toast = useToast();
  const [questions, setQuestions] = useState<any[]>(initialQuestions);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [isSavingQuestion, setIsSavingQuestion] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Form State
  const [questionText, setQuestionText] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [questionType, setQuestionType] = useState("choice"); 
  const [isRequired, setIsRequired] = useState(true);
  const [isMultipleChoice, setIsMultipleChoice] = useState(false);
  const [ratingConfig, setRatingConfig] = useState({ levels: 5, symbol: "Star" });
  
  const [points, setPoints] = useState(1);
  const [options, setOptions] = useState([{ answer: "", correct: false, sequenceOrder: 1, description: "", matrixMatchId: "" }, { answer: "", correct: false, sequenceOrder: 2, description: "", matrixMatchId: "" }]);
  const [matrixColumns, setMatrixColumns] = useState([{ text: "Column 1" }, { text: "Column 2" }]);
  
  // Advanced Features State
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [difficultyLevel, setDifficultyLevel] = useState("Medium");
  const [negativePoints, setNegativePoints] = useState(0);
  const [allowPartialCredit, setAllowPartialCredit] = useState(false);
  const [explanation, setExplanation] = useState("");

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const headingColor = useColorModeValue("gray.800", "white");
  const secondaryTextColor = useColorModeValue("gray.600", "gray.400");
  
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
    setOptions([...options, { answer: "", correct: false, sequenceOrder: options.length + 1, description: "", matrixMatchId: "" }]);
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
    setSubtitle(q.subtitle || "");
    setQuestionType(q.questionType || "choice");
    setIsRequired(q.isRequired ?? true);
    setIsMultipleChoice(q.isMultipleChoice || false);
    setRatingConfig(q.ratingConfig || { levels: 5, symbol: "Star" });
    setPoints(q.points || 1);
    setOptions(q.answers?.length > 0 ? q.answers : [{ answer: "", correct: false, sequenceOrder: 1, description: "", matrixMatchId: "" }]);
    setMatrixColumns(q.matrixColumns?.length > 0 ? q.matrixColumns : [{ text: "Column 1" }, { text: "Column 2" }]);
    
    setDifficultyLevel(q.difficultyLevel || "Medium");
    setNegativePoints(q.negativePoints || 0);
    setAllowPartialCredit(q.allowPartialCredit || false);
    setExplanation(q.explanation || "");
    
    setIsAddingQuestion(true);
    setShowAdvanced(!!q.explanation || q.negativePoints > 0 || q.allowPartialCredit || q.difficultyLevel !== "Medium" || q.points !== 1);
  };

  const resetQuestionForm = () => {
    setQuestionText("");
    setSubtitle("");
    setQuestionType("choice");
    setIsRequired(true);
    setIsMultipleChoice(false);
    setRatingConfig({ levels: 5, symbol: "Star" });
    setPoints(1);
    setOptions([{ answer: "", correct: false, sequenceOrder: 1, description: "", matrixMatchId: "" }, { answer: "", correct: false, sequenceOrder: 2, description: "", matrixMatchId: "" }]);
    setMatrixColumns([{ text: "Column 1" }, { text: "Column 2" }]);
    
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
        subtitle,
        questionType,
        isRequired,
        isMultipleChoice,
        ratingConfig,
        points,
        answers: options,
        matrixColumns,
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
      {/* Sleek MS Forms Title Card */}
      <Box bg={cardBg} rounded="xl" p={0} shadow="md" mb={6} overflow="hidden" borderWidth="1px" borderColor={borderColor}>
        <Box h="8px" w="full" bgGradient={`linear(to-r, ${themeColor}, ${themeColor}80)`} />
        <Box px={6} py={4}>
          <HStack align="flex-start" spacing={4}>
            {isAddingQuestion && (
              <IconButton
                aria-label="Back to Questions"
                icon={<FiArrowLeft size={16} />}
                variant="ghost"
                color={secondaryTextColor}
                bg={useColorModeValue("gray.100", "whiteAlpha.100")}
                onClick={resetQuestionForm}
                size="sm"
                w="32px" h="32px"
                rounded="full"
                mt={0.5}
                _hover={{ bg: useColorModeValue("gray.200", "whiteAlpha.200"), color: headingColor, transform: "translateX(-2px)" }}
                transition="all 0.2s"
              />
            )}
            <Box>
              <Heading size="md" color={headingColor} fontWeight="700" letterSpacing="tight" mb={1}>{quizTitle || "Untitled Quiz"}</Heading>
              <Text color={secondaryTextColor} fontSize="sm">{quizDescription || "No description provided."}</Text>
            </Box>
          </HStack>
        </Box>
      </Box>

      {/* Saved Questions List */}
      {questions.length > 0 && !isAddingQuestion && (
        <VStack spacing={4} align="stretch" mb={8}>
          {questions.map((q, idx) => (
            <Box 
              key={q._id || idx} 
              p={6} 
              bg={cardBg} 
              borderWidth="1px" 
              borderColor={borderColor} 
              rounded="lg" 
              shadow="sm"
              cursor="pointer"
              _hover={{ bg: useColorModeValue("gray.50", "gray.700") }}
              onClick={() => handleEditQuestion(q)}
            >
              <HStack align="flex-start" spacing={4}>
                <Text fontWeight="600" color={headingColor} fontSize="md">{idx + 1}.</Text>
                <Box flex="1">
                  <Text fontWeight="600" fontSize="md" color={headingColor} mb={1}>
                    {q.question}
                  </Text>
                  {q.subtitle && <Text fontSize="sm" color={secondaryTextColor} mb={4}>{q.subtitle}</Text>}
                  
                  {/* Read-only view of options */}
                  <VStack align="start" spacing={2} mt={3}>
                    {q.answers?.map((ans: any, aIdx: number) => (
                      <HStack key={aIdx} spacing={3}>
                        {q.questionType === "choice" || q.questionType === "text" ? (
                          <Box w="16px" h="16px" rounded={q.isMultipleChoice ? "sm" : "full"} borderWidth="1px" borderColor={secondaryTextColor} />
                        ) : null}
                        <Text color={secondaryTextColor}>{ans.answer}</Text>
                      </HStack>
                    ))}
                  </VStack>
                </Box>
              </HStack>
            </Box>
          ))}
        </VStack>
      )}

      {/* Add Button Toolbar */}
      {!isAddingQuestion ? (
        <Flex mt={8} mb={12} justify="center">
          <Flex 
            bg={useColorModeValue("white", "gray.800")} 
            p={2} 
            rounded="full" 
            shadow="md" 
            borderWidth="1px" 
            borderColor={borderColor} 
            alignItems="center" 
            gap={1}
            _hover={{ shadow: "lg", transform: "translateY(-1px)" }}
            transition="all 0.3s"
          >
            <Button size="sm" rounded="full" leftIcon={<Icon as={FaPlus} />} variant="ghost" colorScheme="blue" fontWeight="600" onClick={() => { resetQuestionForm(); setQuestionType("choice"); setIsAddingQuestion(true); }}>Choice</Button>
            <Button size="sm" rounded="full" leftIcon={<Icon as={FaEdit} />} variant="ghost" colorScheme="blue" fontWeight="600" onClick={() => { resetQuestionForm(); setQuestionType("text_input"); setIsAddingQuestion(true); }}>Text</Button>
            <Button size="sm" rounded="full" leftIcon={<Icon as={FiStar} />} variant="ghost" colorScheme="blue" fontWeight="600" onClick={() => { resetQuestionForm(); setQuestionType("rating"); setIsAddingQuestion(true); }}>Rating</Button>
            <Button size="sm" rounded="full" leftIcon={<Icon as={FaClipboardList} />} variant="ghost" colorScheme="blue" fontWeight="600" onClick={() => { resetQuestionForm(); setQuestionType("date"); setIsAddingQuestion(true); }}>Date</Button>
            
            <Box w="1px" h="20px" bg={borderColor} mx={1} />
            
            <Menu placement="bottom-end">
              <MenuButton as={Button} size="sm" rounded="full" rightIcon={<FaChevronDown size={10} />} variant="ghost" colorScheme="gray" fontWeight="600">
                More
              </MenuButton>
              <MenuList shadow="xl" rounded="xl" border="none" py={2} minW="180px">
                <MenuItem icon={<FiList />} onClick={() => { resetQuestionForm(); setQuestionType("fill_in_blanks"); setIsAddingQuestion(true); }}>Fill in the Blanks</MenuItem>
                <MenuItem icon={<FaLink />} onClick={() => { resetQuestionForm(); setQuestionType("matching"); setIsAddingQuestion(true); }}>Matching</MenuItem>
                <MenuItem icon={<FiGrid />} onClick={() => { resetQuestionForm(); setQuestionType("matrix"); setIsAddingQuestion(true); }}>Matrix</MenuItem>
                <MenuItem icon={<FaArrowUp />} onClick={() => { resetQuestionForm(); setQuestionType("sequence"); setIsAddingQuestion(true); }}>Sequence</MenuItem>
                <MenuItem icon={<FiImage />} onClick={() => { resetQuestionForm(); setQuestionType("image"); setIsAddingQuestion(true); }}>Image Upload</MenuItem>
                <MenuItem icon={<FiVideo />} onClick={() => { resetQuestionForm(); setQuestionType("video"); setIsAddingQuestion(true); }}>Video Response</MenuItem>
              </MenuList>
            </Menu>
          </Flex>
        </Flex>
      ) : (
        /* MS Forms Edit Mode */
        <Box bg={cardBg} rounded="lg" p={6} shadow="md" mt={4} mb={8} borderLeftWidth="4px" borderLeftColor="blue.500">
          <VStack spacing={4} align="stretch">
            
            <FormControl isRequired>
              <Input 
                value={questionText} 
                onChange={(e) => setQuestionText(e.target.value)} 
                placeholder="Question" 
                size="md"
                variant="flushed"
                fontSize="md"
                fontWeight="600"
                focusBorderColor="blue.500"
                bg={useColorModeValue("gray.50", "gray.800")}
                p={3}
                rounded="sm"
              />
            </FormControl>
            
            <FormControl>
              <Input 
                value={subtitle} 
                onChange={(e) => setSubtitle(e.target.value)} 
                placeholder="Enter a subtitle (optional)" 
                variant="flushed"
                color={secondaryTextColor}
                focusBorderColor="blue.400"
              />
            </FormControl>

            {/* Dynamic Options Section based on Type */}
            <Box mt={4}>
              
              {questionType === "text_input" && (
                <Box>
                  <Textarea placeholder="Users will type their answer here..." isDisabled rows={3} bg={useColorModeValue("gray.50", "gray.800")} rounded="md" mb={4} />
                  <Box p={4} bg={useColorModeValue("gray.50", "gray.800")} rounded="lg" borderWidth="1px" borderColor={borderColor}>
                    <FormLabel color={secondaryTextColor} fontWeight="semibold" fontSize="sm">Correct Answer(s) for Auto-grading</FormLabel>
                    <Text fontSize="xs" color={secondaryTextColor} mb={4}>If provided, the system will auto-grade if the student's text matches any of these. If left empty, it requires manual grading.</Text>
                    <VStack align="stretch" spacing={3}>
                      {options.map((opt, idx) => (
                         <HStack key={`txt-ans-${idx}`}>
                           <Input 
                             placeholder="Enter an accepted correct answer"
                             value={opt.answer}
                             onChange={(e) => {
                               const newOptions = [...options];
                               newOptions[idx].answer = e.target.value;
                               newOptions[idx].correct = true;
                               setOptions(newOptions);
                             }}
                             size="sm"
                             rounded="md"
                             bg={useColorModeValue("white", "gray.900")}
                           />
                           <IconButton aria-label="Remove" icon={<FaTrash />} size="sm" variant="ghost" colorScheme="red" onClick={() => {
                             const newOptions = [...options];
                             newOptions.splice(idx, 1);
                             setOptions(newOptions);
                           }} />
                         </HStack>
                      ))}
                      <Button size="sm" colorScheme="blue" variant="ghost" onClick={() => setOptions([...options, { answer: "", correct: true, sequenceOrder: options.length + 1, description: "", matrixMatchId: "" }])} alignSelf="flex-start">
                         + Add correct answer
                      </Button>
                    </VStack>
                  </Box>
                </Box>
              )}
              
              {questionType === "rating" && (
                <Flex align="center" gap={4} p={6} bg={useColorModeValue("gray.50", "gray.800")} rounded="xl" borderWidth="1px" borderColor={borderColor}>
                  <FormControl w="auto">
                    <FormLabel>Levels</FormLabel>
                    <Select value={ratingConfig.levels} onChange={(e) => setRatingConfig({...ratingConfig, levels: Number(e.target.value)})}>
                      {[2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
                    </Select>
                  </FormControl>
                  <FormControl w="auto">
                    <FormLabel>Symbol</FormLabel>
                    <Select value={ratingConfig.symbol} onChange={(e) => setRatingConfig({...ratingConfig, symbol: e.target.value})}>
                      <option value="Star">Star (⭐)</option>
                      <option value="Number">Number (1, 2, 3)</option>
                    </Select>
                  </FormControl>
                </Flex>
              )}

              {questionType === "date" && (
                <Box>
                  <Input type="date" isDisabled bg={useColorModeValue("gray.50", "gray.800")} rounded="md" maxW="300px" mb={4} />
                  <Box p={4} bg={useColorModeValue("gray.50", "gray.800")} rounded="lg" borderWidth="1px" borderColor={borderColor}>
                    <FormLabel color={secondaryTextColor} fontWeight="semibold" fontSize="sm">Correct Date for Auto-grading (Optional)</FormLabel>
                    <Text fontSize="xs" color={secondaryTextColor} mb={4}>If provided, the system will auto-grade if the student selects this exact date. Leave empty for manual grading.</Text>
                    <Input 
                       type="date"
                       maxW="300px"
                       value={options.length > 0 ? options[0].answer : ""}
                       onChange={(e) => {
                         const newOptions = [...options];
                         if (newOptions.length === 0) {
                           newOptions.push({ answer: e.target.value, correct: true, sequenceOrder: 1, description: "", matrixMatchId: "" });
                         } else {
                           newOptions[0].answer = e.target.value;
                           newOptions[0].correct = true;
                         }
                         setOptions(newOptions);
                       }}
                       size="md"
                       rounded="md"
                       bg={useColorModeValue("white", "gray.900")}
                    />
                  </Box>
                </Box>
              )}
              
              {questionType === "fill_in_blanks" && (
                <Box bg="blue.50" p={4} rounded="md" borderLeftWidth="4px" borderLeftColor="blue.400">
                  <Text fontSize="sm" color="blue.700">
                    <strong>Instructions:</strong> Type your sentence in the Question box above and use brackets to specify the blanks. 
                    For example: <em>The capital of France is [Paris]</em>.
                  </Text>
                </Box>
              )}

              {(questionType === "image" || questionType === "video") && (
                <Box bg="blue.50" p={4} rounded="md" borderLeftWidth="4px" borderLeftColor="blue.400">
                  <Text fontSize="sm" color="blue.700">
                    <strong>Instructions:</strong> Write the prompt above. Students will see an upload button to submit their {questionType} response.
                  </Text>
                </Box>
              )}

              {((questionType as string) === "choice" || (questionType as string) === "text" || (questionType as string) === "sequence" || (questionType as string) === "matching" || (questionType as string) === "matrix") && (
                <Box>
                  {questionType === "matrix" && (
                    <Box mb={6}>
                      <FormLabel color={secondaryTextColor} fontWeight="semibold">Columns (Options)</FormLabel>
                      <VStack align="stretch" spacing={2}>
                        {matrixColumns.map((col, idx) => (
                          <HStack key={`col-${idx}`}>
                            <Input value={col.text} onChange={(e) => {
                              const newCols = [...matrixColumns];
                              newCols[idx].text = e.target.value;
                              setMatrixColumns(newCols);
                            }} placeholder={`Column ${idx + 1} (e.g. Strongly Agree)`} size="sm" rounded="md" />
                            <IconButton aria-label="Remove" icon={<FaTrash />} size="sm" variant="ghost" colorScheme="red" onClick={() => {
                              const newCols = [...matrixColumns];
                              newCols.splice(idx, 1);
                              setMatrixColumns(newCols);
                            }} />
                          </HStack>
                        ))}
                        <Button size="sm" leftIcon={<FaPlus />} variant="ghost" onClick={() => setMatrixColumns([...matrixColumns, { text: `Column ${matrixColumns.length + 1}` }])}>Add Column</Button>
                      </VStack>
                      <FormLabel color={secondaryTextColor} fontWeight="semibold" mt={4}>Rows (Statements)</FormLabel>
                    </Box>
                  )}
                  <VStack spacing={3} align="stretch">
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
                      placeholder={questionType === "matching" ? `Prompt A${idx + 1} (Left Side)` : questionType === "matrix" ? `Row ${idx + 1}` : `Option ${idx + 1}`} 
                      value={opt.answer} 
                      onChange={(e) => handleOptionChange(idx, "answer", e.target.value)} 
                      variant="unstyled"
                      px={2}
                      fontWeight="medium"
                    />

                    {/* Secondary Input for Matching */}
                    {questionType === "matching" && (
                      <>
                        <Icon as={FaLink} color="blue.400" mx={2} />
                        <Input 
                          placeholder={`Match B${idx + 1} (Right Side)`} 
                          value={opt.matrixMatchId} 
                          onChange={(e) => handleOptionChange(idx, "matrixMatchId", e.target.value)} 
                          variant="unstyled"
                          px={2}
                          fontWeight="medium"
                          borderLeftWidth="1px"
                          borderColor={borderColor}
                          pl={4}
                        />
                      </>
                    )}

                    {/* Standard Text/Choice Options */}
                    {((questionType as string) === "choice" || (questionType as string) === "text" || (questionType as string) === "image" || (questionType as string) === "video") && (
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

                    <IconButton aria-label="Remove" icon={<FaTrash />} colorScheme="gray" color="gray.400" variant="ghost" size="sm" _hover={{ color: "red.500", bg: "gray.100" }} onClick={() => handleRemoveOption(idx)} />
                  </HStack>
                ))}
                <Flex w="full">
                  <Button 
                    w="full"
                    size="sm" 
                    leftIcon={<FaPlus />} 
                    variant="outline" 
                    borderStyle="dashed"
                    borderWidth="2px"
                    colorScheme="blue" 
                    mt={4} 
                    onClick={handleAddOption}
                  >
                    {questionType === "matching" ? "Add Pair" : questionType === "matrix" ? "Add Row" : questionType === "sequence" ? "Add Sequence Step" : "Add Option"}
                  </Button>
                </Flex>
              </VStack>
              </Box>
              )}
            </Box>

            {/* Toggles (Required, Multiple) */}
            <Flex justify="flex-end" mb={4} mt={4}>
              <HStack spacing={6}>
                {(questionType === "choice" || questionType === "image") && (
                  <FormControl display="flex" alignItems="center" w="auto">
                    <FormLabel htmlFor="multiple-switch" mb="0" fontSize="sm" fontWeight="medium" color={secondaryTextColor} mr={3}>Multiple Answers</FormLabel>
                    <Switch id="multiple-switch" colorScheme="blue" isChecked={isMultipleChoice} onChange={(e) => setIsMultipleChoice(e.target.checked)} />
                  </FormControl>
                )}
                
                <FormControl display="flex" alignItems="center" w="auto">
                  <FormLabel htmlFor="required-switch" mb="0" fontSize="sm" fontWeight="medium" color={secondaryTextColor} mr={3}>Required</FormLabel>
                  <Switch id="required-switch" colorScheme="blue" isChecked={isRequired} onChange={(e) => setIsRequired(e.target.checked)} />
                </FormControl>
              </HStack>
            </Flex>

            {/* Advanced Settings Toggle */}
            <Box w="full" mt={2}>
              <Button 
                w="full"
                variant="ghost" 
                colorScheme="blue" 
                bg={useColorModeValue("blue.50", "whiteAlpha.100")}
                rightIcon={showAdvanced ? <FaChevronUp /> : <FaChevronDown />} 
                onClick={() => setShowAdvanced(!showAdvanced)}
                size="sm"
                justifyContent="space-between"
                px={4}
                _hover={{ bg: useColorModeValue("blue.100", "whiteAlpha.200") }}
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

            <Flex justify="flex-end" align="center" pt={6} mt={6} borderTopWidth="1px" borderColor={borderColor}>
              <HStack spacing={3}>
                <Button variant="ghost" onClick={resetQuestionForm} color={secondaryTextColor}>
                  Cancel
                </Button>
                <Button bg="blue.500" color="white" size="md" onClick={handleSaveQuestion} isLoading={isSavingQuestion} shadow="sm" _hover={{ bg: "blue.600" }} px={8}>
                  {editingQuestionId ? "Update" : "Save"}
                </Button>
              </HStack>
            </Flex>
          </VStack>
        </Box>
      )}
    </Box>
  );
}
