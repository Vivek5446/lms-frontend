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
  useToast,
  useDisclosure,
  useColorModeValue
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import CustomButton from "../../../../../component/common/CustomButton/CustomButton";
import EnquireFormModal from "../../../../../component/common/EnquireFormModal/EnquireFormModal";

export default function AssessmentForm({
  title,
  description,
  questions,
  interpretScore,
  primaryColor = "#045B64",
  secondaryColor = "#0A7C8C"
}) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState(Array(questions.length).fill(null));
  const [score, setScore] = useState(null);
  const [maxScore, setMaxScore] = useState(0);
  const [readyToSubmit, setReadyToSubmit] = useState(false);
  const toast = useToast();
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const cardBg = useColorModeValue("white", "gray.700");
  const progressColor = useColorModeValue("teal.100", "teal.900");

  // Calculate maximum possible score dynamically based on the number of options for each question
  useEffect(() => {
    const calculatedMaxScore = questions.reduce((total, question) => {
      // Each question's max score is (number of options - 1) assuming 0-based scoring
      return total + (question.options.length - 1);
    }, 0);
    setMaxScore(calculatedMaxScore);
  }, [questions]);

  // Effect to monitor when all questions are answered and ready to submit
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
    onOpen(); // Open the enquiry form modal
  };

  const handleFormSubmit = () => {
    const totalScore = answers.reduce((acc, curr) => acc + curr, 0);
    setScore({
      obtained: totalScore,
      max: maxScore
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateQuestion = (direction) => {
    if (direction === 'prev' && currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      window.scrollTo({ behavior: 'smooth' });
    }
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <Container maxW="5xl" py={8}>
      <Box
        bg={cardBg}
        borderRadius="2xl"
        mb={8}
      >
        {score === null && (
          <>
            <Heading
              mb={6}
              textAlign="center"
              color={primaryColor}
              fontSize={{ base: "2xl", md: "3xl" }}
            >
              {title}
            </Heading>

            <Text textAlign="center" mb={8} color="gray.600">
              {description}
            </Text>
          </>
        )}

        <Progress
          value={progress}
          size="sm"
          colorScheme="teal"
          mb={8}
          borderRadius="full"
          bg={progressColor}
          display={score === null ? "block" : "none"}
        />

        {score === null ? (
          <>
            <Box
              key={currentQuestion}
              mb={8}
              p={6}
              borderWidth="1px"
              borderRadius="lg"
              borderColor="gray.200"
            >
              <Text fontSize="lg" fontWeight="bold" mb={4} color={primaryColor}>
                Question {currentQuestion + 1}
              </Text>
              <Text fontSize="lg" fontWeight={500} mb={6}>
                {questions[currentQuestion].question}
              </Text>

              <RadioGroup
                onChange={(value) => handleOptionChange(currentQuestion, value)}
                value={answers[currentQuestion]?.toString()}
              >
                <Stack spacing={4}>
                  {questions[currentQuestion].options.map((option, index) => (
                    <Radio
                      key={index}
                      value={index.toString()}
                      colorScheme="teal"
                      size="lg"
                      borderColor="gray.300"
                    >
                      <Text fontSize="md">{option}</Text>
                    </Radio>
                  ))}
                </Stack>
              </RadioGroup>
            </Box>

            <Flex justify="space-between" mt={8}>
              <Button
                onClick={() => navigateQuestion('prev')}
                isDisabled={currentQuestion === 0}
                colorScheme="gray"
                variant="outline"
                size="lg"
              >
                Previous
              </Button>

              {currentQuestion === questions.length - 1 && (
                <CustomButton
                  onClick={() => handleSubmit()}
                  colorScheme="teal"
                  size="lg"
                  px={10}
                  isDisabled={answers[currentQuestion] === null}
                >
                  Submit Assessment
                </CustomButton>
              )}
            </Flex>
          </>
        ) : (
          <Box
            mt={8}
            p={8}
            borderWidth="1px"
            borderRadius="lg"
            borderColor="gray.200"
            bg="teal.50"
            textAlign="center"
          >
            <Heading size="xl" mb={6} color={primaryColor}>
              Assessment Complete
            </Heading>

            <Box
              display="inline-block"
              p={6}
              borderRadius="full"
              bg={secondaryColor}
              color="white"
              mb={6}
            >
              <Text fontSize="4xl" fontWeight="bold">{score.obtained}/{score.max}</Text>
              <Text>Total Score</Text>
            </Box>

            <Divider mb={6} />

            <Box fontSize="xl" mb={6}>
              <Text fontWeight="bold" color={primaryColor} mb={2}>
                {interpretScore(score.obtained).severity}
              </Text>
              <Text>
                {interpretScore(score.obtained).description}
              </Text>
            </Box>

            <Text fontSize="md" mb={4} color="gray.600">
              Find expert support for your concerns by consulting a Dental therapist.
            </Text>

            <Flex justify="center" gap={4}>
              <CustomButton
                colorScheme="teal"
                size="lg"
                onClick={() => router.push('/therapist')}
              >
                Get Professional Support
              </CustomButton>
            </Flex>
          </Box>
        )}
      </Box>

      <EnquireFormModal
        isOpen={isOpen}
        handleFormSubmit={handleFormSubmit}
        pageLink="self Assessment"
        onClose={() => {
          onClose();
        }}
      />
    </Container>
  );
}