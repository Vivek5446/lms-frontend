"use client";

import {
  Box,
  Heading,
  Text,
  VStack,
  Radio,
  RadioGroup,
  Checkbox,
  Stack,
  Input,
  Button,
  useColorModeValue,
  Table, Thead, Tbody, Tr, Th, Td, Select, HStack, Icon, Badge, Flex
} from "@chakra-ui/react";
import { FiStar, FiUploadCloud, FiVideo } from "react-icons/fi";

export default function QuizPreview({ 
  quizData, 
  themeColor = "#0078D4" 
}: { 
  quizData: any;
  themeColor?: string;
}) {
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const headingColor = useColorModeValue("gray.800", "white");
  const secondaryTextColor = useColorModeValue("gray.600", "gray.400");

  const questions = quizData?.questions || [];

  return (
    <Box w="full" mx="auto">
      {/* Title Card */}
      <Box bg={cardBg} rounded="xl" p={0} shadow="md" mb={6} overflow="hidden" borderWidth="1px" borderColor={borderColor}>
        <Box h="8px" w="full" bgGradient={`linear(to-r, ${themeColor}, ${themeColor}80)`} />
        <Box px={8} py={6}>
          <Heading size="lg" color={headingColor} fontWeight="700" letterSpacing="tight" mb={2}>
            {quizData?.title || "Untitled Quiz"}
          </Heading>
          <Text color={secondaryTextColor} fontSize="md">
            {quizData?.description || "No description provided."}
          </Text>
        </Box>
      </Box>

      {/* Questions Preview */}
      <VStack spacing={6} align="stretch">
        {questions.length === 0 ? (
          <Box bg={cardBg} p={8} rounded="lg" shadow="sm" textAlign="center">
            <Text color={secondaryTextColor}>No questions added yet. Go to the Questions tab to add some!</Text>
          </Box>
        ) : (
          questions.map((q: any, idx: number) => (
            <Box key={q._id || idx} bg={cardBg} p={8} rounded="xl" shadow="sm" borderWidth="1px" borderColor={borderColor}>
              <Heading size="md" color={headingColor} fontWeight="600" mb={q.subtitle ? 1 : 4}>
                {idx + 1}. {q.questionType === "fill_in_blanks" ? "Fill in the blanks below:" : q.question}
                {q.isRequired && <Text as="span" color="red.500" ml={1}>*</Text>}
              </Heading>
              
              {q.subtitle && (
                <Text fontSize="sm" color={secondaryTextColor} mb={4}>
                  {q.subtitle}
                </Text>
              )}

              {/* Render Question Inputs Based on Type */}
              {q.questionType === "fill_in_blanks" && (
                <Box lineHeight="2.5" fontSize="lg" color={headingColor}>
                  {q.question.split(/(\[.*?\])/).map((part: string, i: number) => {
                    if (part.startsWith("[") && part.endsWith("]")) {
                      return <Input key={i} display="inline-block" w="150px" mx={2} size="sm" bg={useColorModeValue("gray.50", "gray.700")} borderColor={themeColor} />;
                    }
                    return <span key={i}>{part}</span>;
                  })}
                </Box>
              )}

              {(q.questionType === "image" || q.questionType === "video") && (
                <Flex direction="column" align="center" justify="center" p={10} borderStyle="dashed" borderWidth="2px" borderColor={borderColor} rounded="xl" bg={useColorModeValue("gray.50", "gray.800")}>
                  <Icon as={q.questionType === "image" ? FiUploadCloud : FiVideo} boxSize={10} color={secondaryTextColor} mb={4} />
                  <Button 
                    colorScheme="blue" 
                    variant="outline"
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = q.questionType === "image" ? "image/*" : "video/*";
                      input.click();
                    }}
                  >
                    {q.questionType === "image" ? "Upload Image" : "Record / Upload Video"}
                  </Button>
                </Flex>
              )}

              {q.questionType === "matching" && (
                <VStack spacing={4} align="stretch">
                  {q.answers?.map((ans: any, aIdx: number) => (
                    <HStack key={aIdx} spacing={4}>
                      <Box flex={1} p={3} bg={useColorModeValue("gray.50", "gray.700")} rounded="md" borderWidth="1px" borderColor={borderColor}>
                        <Text fontWeight="medium" color={headingColor}>{ans.answer}</Text>
                      </Box>
                      <Select flex={1} placeholder="Select match..." bg={useColorModeValue("gray.50", "gray.700")}>
                        {q.answers?.map((matchOpt: any, mIdx: number) => (
                          <option key={mIdx} value={matchOpt.matrixMatchId}>{matchOpt.matrixMatchId}</option>
                        ))}
                      </Select>
                    </HStack>
                  ))}
                </VStack>
              )}

              {q.questionType === "matrix" && (
                <Box overflowX="auto">
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th></Th>
                        {q.matrixColumns?.map((col: any, cIdx: number) => (
                          <Th key={cIdx} textAlign="center">{col.text}</Th>
                        ))}
                      </Tr>
                    </Thead>
                    <Tbody>
                      {q.answers?.map((ans: any, aIdx: number) => (
                        <Tr key={aIdx}>
                          <Td fontWeight="medium">{ans.answer}</Td>
                          {q.matrixColumns?.map((col: any, cIdx: number) => (
                            <Td key={cIdx} textAlign="center">
                              <Radio name={`matrix-${idx}-${aIdx}`} colorScheme="blue" />
                            </Td>
                          ))}
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              )}

              {q.questionType === "sequence" && (
                <VStack spacing={3} align="stretch">
                  {q.answers?.map((ans: any, aIdx: number) => (
                    <HStack key={aIdx} p={3} bg={useColorModeValue("gray.50", "gray.700")} rounded="md" borderWidth="1px" borderColor={borderColor}>
                      <Select w="80px" size="sm" defaultValue={aIdx + 1}>
                        {q.answers?.map((_: any, sIdx: number) => (
                          <option key={sIdx} value={sIdx + 1}>{sIdx + 1}</option>
                        ))}
                      </Select>
                      <Text ml={2} fontWeight="medium" color={headingColor}>{ans.answer}</Text>
                    </HStack>
                  ))}
                </VStack>
              )}

              {(q.questionType === "choice" || !q.questionType) && (
                q.isMultipleChoice ? (
                  <Stack spacing={3}>
                    {q.answers?.map((ans: any, aIdx: number) => (
                      <Checkbox key={aIdx} colorScheme="blue" size="lg">
                        <Text fontSize="md" color={headingColor}>{ans.answer}</Text>
                      </Checkbox>
                    ))}
                  </Stack>
                ) : (
                  <RadioGroup>
                    <Stack spacing={3}>
                      {q.answers?.map((ans: any, aIdx: number) => (
                        <Radio key={aIdx} value={String(aIdx)} colorScheme="blue" size="lg">
                          <Text fontSize="md" color={headingColor}>{ans.answer}</Text>
                        </Radio>
                      ))}
                    </Stack>
                  </RadioGroup>
                )
              )}

              {q.questionType === "text_input" && (
                <Input placeholder="Enter your answer" size="lg" bg={useColorModeValue("gray.50", "gray.700")} />
              )}

              {q.questionType === "rating" && (
                <Stack direction="row" spacing={2} mt={2}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FiStar key={star} size={28} color="#CBD5E0" />
                  ))}
                </Stack>
              )}

              {q.questionType === "date" && (
                <Input type="date" size="lg" maxW="200px" bg={useColorModeValue("gray.50", "gray.700")} />
              )}
            </Box>
          ))
        )}
      </VStack>

      {/* Fake Submit Button */}
      {questions.length > 0 && (
        <Box mt={8}>
          <Button bg={themeColor} color="white" size="lg" px={10} _hover={{ opacity: 0.9 }}>
            Submit
          </Button>
        </Box>
      )}
    </Box>
  );
}
