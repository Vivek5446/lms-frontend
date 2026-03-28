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
import { useState } from "react";

import { useRouter } from 'next/navigation';
import EnquireFormModal from "../../../../../component/common/EnquireFormModal/EnquireFormModal";
import CustomButton from "../../../../../component/common/CustomButton/CustomButton";

// Questions for the PTSD Assessment
const ptQuestions = [
  { question: "Having upsetting dreams that replay part of the experience or are clearly related to the experience?" },
  { question: "Having powerful images or memories that sometimes come into your mind in which you feel the experience is happening again in the here and now?" },
  { question: "Avoiding internal reminders of the experience (for example, thoughts, feelings, or physical sensations)?" },
  { question: "Avoiding external reminders of the experience (for example, people, places, conversations, objects, activities, or situations)?" },
  { question: "Being 'super-alert', watchful, or on guard?" },
  { question: "Feeling jumpy or easily startled?" },
  { question: "In the past month, have the above problems affected your relationships or social life?" },
  { question: "Affected your work or ability to work?" },
  { question: "Affected any other important part of your life such as parenting, or school or college work, or other important activities?" },
  { question: "When I am upset, it takes me a long time to calm down." },
  { question: "I feel numb or emotionally shut down." },
  { question: "I feel like a failure." },
  { question: "I feel worthless." },
  { question: "I feel distant or cut off from people." },
  { question: "I find it hard to stay emotionally close to people." },
  { question: "Created concern or distress about your relationships or social life?" },
  { question: "In the past month, have the above problems affected your work or ability to work?" },
  { question: "In the past month, have the above problems affected any other important parts of your life such as parenting, or school or college work, or other important activities?" }
];

const options = ["Not at all", "A little bit", "Moderately", "Quite a bit", "Extremely"];

export default function PostTraumaticAssessment() {
  const [answers, setAnswers] = useState(Array(ptQuestions.length).fill(null));
  const [score, setScore] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();

  const primaryColor = "#045B64";
  const secondaryColor = "#0A7C8C";
  const cardBg = useColorModeValue("white", "gray.700");
  const progressColor = useColorModeValue("teal.100", "teal.900");

  const handleOptionChange = (questionIndex, value) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = parseInt(value);
    setAnswers(newAnswers);

    if (questionIndex < ptQuestions.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(questionIndex + 1);
      }, 500);
    } else {
      setTimeout(() => {
        handleSubmit();
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
    setScore(totalScore);
    onClose();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const progress = ((currentQuestion + 1) / ptQuestions.length) * 100;

  const navigateQuestion = (direction) => {
    if (direction === 'prev' && currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <Container maxW="5xl" py={8}>
      <Box
        bg={cardBg}
        borderRadius="2xl"
        boxShadow="md"
        p={8}
        mb={8}
      >
        <Heading
          mb={6}
          textAlign="center"
          color={primaryColor}
          fontSize={{ base: "2xl", md: "3xl" }}
        >
          Instructions
        </Heading>

        <Text textAlign="center" mb={8} color="gray.600">
          Please rate how much you have been bothered by each problem below over the past month.
        </Text>

        <Progress
          value={progress}
          size="sm"
          colorScheme="teal"
          mb={8}
          borderRadius="full"
          bg={progressColor}
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
              <Text fontSize="lg" fontWeight={500} mb={6}>{ptQuestions[currentQuestion].question}</Text>

              <RadioGroup
                onChange={(value) => handleOptionChange(currentQuestion, value)}
                value={answers[currentQuestion]?.toString()}
              >
                <Stack spacing={4}>
                  {options.map((option, index) => (
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

              {currentQuestion === ptQuestions.length - 1 && (
                <CustomButton
                  onClick={handleSubmit}
                  colorScheme="teal"
                  size="lg"
                >
                  Submit
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
              <Text fontSize="4xl" fontWeight="bold">{score}</Text>
              <Text>Total Score</Text>
            </Box>

            <Divider mb={6} />

            <Text fontSize="xl" mb={6}>
              {score >= 20
                ? "Your responses suggest significant trauma-related symptoms. We recommend consulting a mental health professional."
                : "Your responses suggest mild trauma-related symptoms. Still, consider talking to a professional if you have concerns."}
            </Text>

            <Text fontSize="md" mb={4} color="gray.600">
              Find expert support by consulting a Dental therapist.
            </Text>

            <CustomButton
              colorScheme="teal"
              size="lg"
              onClick={() => router.push('/therapist')}
            >
              Get Professional Support
            </CustomButton>
          </Box>
        )}
      </Box>

      {/* Enquiry Form Modal */}
      <EnquireFormModal
        isOpen={isOpen}
        onClose={() => {
          onClose();
          handleFormSubmit();
        }}
      />
    </Container>
  );
}
