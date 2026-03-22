import {
  Box,
  Button,
  Container,
  Divider,
  Flex,
  Heading,
  Progress,
  Radio,
  RadioGroup,
  Stack,
  Text,
  useColorModeValue,
  useToast,
  useDisclosure
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { questions } from "./utils/constant";
import CustomButton from "../../../../component/common/CustomButton/CustomButton";
import EnquireFormModal from "../../../../component/common/EnquireFormModal/EnquireFormModal";
import { useRouter } from 'next/navigation';

// ASRM - Responsive for Mobile

export default function SelfAssessment() {
  const [answers, setAnswers] = useState(Array(questions.length).fill(null));
  const [score, setScore] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [readyToSubmit, setReadyToSubmit] = useState(false);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();

  const primaryColor = "#045B64";
  const secondaryColor = "#0A7C8C";
  const cardBg = useColorModeValue("white", "gray.700");
  const progressColor = useColorModeValue("teal.100", "teal.900");

  // Calculate maximum possible score
  const maxScore = questions.reduce((total, question) => {
    return total + (question.options.length - 1);
  }, 0);

  // Effect to monitor when all questions are answered
  useEffect(() => {
    if (readyToSubmit && !answers.includes(null)) {
      onOpen();
      setReadyToSubmit(false);
    }
  }, [answers, readyToSubmit, onOpen]);

  const handleOptionChange = (questionIndex, value) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = parseInt(value);
    setAnswers(newAnswers);

    if (questionIndex < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(questionIndex + 1);
      }, 500);
    } else {
      // For the last question, set ready to submit instead of immediate submission
      setTimeout(() => {
        setReadyToSubmit(true);
      }, 500);
    }
  };

  const handleSubmit = () => {
    if (answers.includes(null)) {
      toast({
        title: "Incomplete Assessment",
        description: "Please answer all questions before submitting.",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top"
      });
      return;
    }
    onOpen();
  };

  const handleFormSubmit = () => {
    const totalScore = answers.reduce((acc, curr) => acc + curr, 0);
    setScore({
      obtained: totalScore,
      max: maxScore
    });
    onClose(); // Form closes itself after submission
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const navigateQuestion = (direction) => {
    if (direction === 'prev' && currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <Container maxW="5xl" py={{ base: 4, md: 8 }} px={{ base: 3, md: 6 }}>
      <Box
        bg={cardBg}
        borderRadius="xl"
        p={{ base: 0, md: 8 }}
        mb={{ base: 4, md: 8 }}
      >
        {score === null && (
          <>
            <Heading
              mb={{ base: 4, md: 6 }}
              textAlign="center"
              color={primaryColor}
              fontSize={{ base: "xl", md: "3xl" }}
            >
              Instructions
            </Heading>

            <Text textAlign="center" mb={{ base: 6, md: 8 }} color="gray.600" fontSize={{ base: "sm", md: "md" }}>
              Choose one statement in each group that best describes the way you have been feeling for the past month.
            </Text>
          </>
        )}

        <Progress
          value={progress}
          size="sm"
          colorScheme="teal"
          mb={{ base: 5, md: 8 }}
          borderRadius="full"
          bg={progressColor}
          display={score === null ? "block" : "none"}
        />

        {score === null ? (
          <>
            <Box
              key={currentQuestion}
              mb={{ base: 4, md: 8 }}
              p={{ base: 3, md: 6 }}
              borderWidth="1px"
              borderRadius="lg"
              borderColor="gray.200"
            >
              <Text fontSize={{ base: "md", md: "lg" }} fontWeight="bold" mb={{ base: 2, md: 4 }} color={primaryColor}>
                Question {currentQuestion + 1}
              </Text>
              <Text fontSize={{ base: "md", md: "lg" }} fontWeight={500} mb={{ base: 4, md: 6 }}>{questions[currentQuestion]?.question}</Text>

              <RadioGroup
                onChange={(value) => handleOptionChange(currentQuestion, value)}
                value={answers[currentQuestion]?.toString()}
              >
                <Stack spacing={{ base: 2, md: 4 }}>
                  {questions[currentQuestion].options.map((option, optionIndex) => (
                    <Radio
                      key={optionIndex}
                      value={optionIndex.toString()}
                      colorScheme="teal"
                      size={{ base: "md", md: "lg" }}
                      borderColor="gray.300"
                    >
                      <Text fontSize={{ base: "sm", md: "md" }}>{option}</Text>
                    </Radio>
                  ))}
                </Stack>
              </RadioGroup>
            </Box>

            <Flex justify="space-between" mt={{ base: 5, md: 8 }} direction={{ base: "column", sm: "row" }} gap={{ base: 3, sm: 0 }}>
              <Button
                onClick={() => navigateQuestion('prev')}
                isDisabled={currentQuestion === 0}
                colorScheme="gray"
                variant="outline"
                size={{ base: "md", md: "lg" }}
                w={{ base: "full", sm: "auto" }}
                mb={{ base: 2, sm: 0 }}
              >
                Previous
              </Button>

              {currentQuestion === questions.length - 1 && (
                <CustomButton
                  onClick={handleSubmit}
                  colorScheme="teal"
                  size={{ base: "md", md: "lg" }}
                  px={{ base: 5, md: 10 }}
                  isDisabled={answers[currentQuestion] === null}
                  w={{ base: "full", sm: "auto" }}
                >
                  Submit Assessment
                </CustomButton>
              )}
            </Flex>
          </>
        ) : (
          <Box
            mt={{ base: 4, md: 8 }}
            p={{ base: 4, md: 8 }}
            borderWidth="1px"
            borderRadius="lg"
            borderColor="gray.200"
            bg="teal.50"
            textAlign="center"
          >
            <Heading size={{ base: "lg", md: "xl" }} mb={{ base: 4, md: 6 }} color={primaryColor}>
              Assessment Complete
            </Heading>

            <Box
              display="inline-block"
              p={{ base: 4, md: 6 }}
              borderRadius="full"
              bg={secondaryColor}
              color="white"
              mb={{ base: 4, md: 6 }}
            >
              <Text fontSize={{ base: "3xl", md: "4xl" }} fontWeight="bold">{score.obtained}/{score.max}</Text>
              <Text fontSize={{ base: "sm", md: "md" }}>Total Score</Text>
            </Box>

            <Divider mb={{ base: 4, md: 6 }} />

            <Text fontSize={{ base: "lg", md: "xl" }} mb={{ base: 4, md: 6 }}>
              {score.obtained >= (score.max / 2)
                ? "Your responses suggest a high probability of manic or hypomanic condition. We recommend consulting with a mental health professional for further evaluation."
                : "Your responses suggest a low probability of mania. However, if you have concerns about your mental health, consider speaking with a professional."}
            </Text>

            <Text fontSize={{ base: "sm", md: "md" }} mb={{ base: 3, md: 4 }} color="gray.600">
              Find expert support for your concerns by consulting a Dental therapist.
            </Text>

            <CustomButton
              colorScheme="teal"
              size={{ base: "md", md: "lg" }}
              w={{ base: "full", md: "auto" }}
              onClick={() => router.push('/therapist')}
            >
              Get Professional Support
            </CustomButton>
          </Box>
        )}
      </Box>

      <EnquireFormModal
        isOpen={isOpen}
        pageLink="self Assessment"
        handleFormSubmit={handleFormSubmit}
        onClose={() => {
          onClose();
        }}
      />
    </Container>
  );
}