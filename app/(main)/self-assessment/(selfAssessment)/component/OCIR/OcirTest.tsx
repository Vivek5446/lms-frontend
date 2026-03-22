import { Box, Button, Grid, Heading, Radio, RadioGroup, Text, useToast } from "@chakra-ui/react";
import { useState } from "react";

const questions = [
  "I have saved up so many things that they get in the way.",
  "I check things more often than necessary.",
  "I get upset if objects are not arranged properly.",
  "I feel compelled to count while I am doing things.",
  "I find it difficult to touch an object when I know it has been touched by strangers or certain people.",
  "I find it difficult to control my own thoughts.",
  "I collect things I don't need.",
  "I repeatedly check doors, windows, drawers, etc.",
  "I get upset if others change the way I have arranged things.",
  "I feel I have to repeat certain numbers.",
  "I sometimes have to wash or clean myself simply because I feel contaminated.",
  "I am upset by unpleasant thoughts that come into my mind against my will.",
  "I avoid throwing things away because I am afraid I might need them later.",
  "I repeatedly check gas and water taps and light switches after turning them off.",
  "I need things to be arranged in a particular way.",
  "I feel that there are good and bad numbers.",
  "I wash my hands more often and longer than necessary.",
  "I frequently get nasty thoughts and have difficulty in getting rid of them."
];

const options = [
  "Not at all",
  "A little",
  "Moderately",
  "A lot",
  "Extremely"
];

// OCI-R Subscales - each item belongs to one of six symptom dimensions
const subscales: Record<string, number[]> = {
  Hoarding: [0, 6, 12],
  Checking: [1, 7, 13],
  Ordering: [2, 8, 14],
  Neutralizing: [3, 9, 15],
  Washing: [4, 10, 16],
  Obsessing: [5, 11, 17]
};

interface SubscaleScores {
  [key: string]: number;
}

export default function OCIRAssessment() {
  const [answers, setAnswers] = useState<number[]>(Array(questions.length).fill(null));
  const [score, setScore] = useState<number | null>(null);
  const [subscaleScores, setSubscaleScores] = useState<SubscaleScores | null>(null);
  const toast = useToast();

  const handleOptionChange = (questionIndex: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = parseInt(value);
    setAnswers(newAnswers);
  };

  const calculateSubscaleScores = (answers: number[]): SubscaleScores => {
    const scores: SubscaleScores = {};

    for (const [subscale, indices] of Object.entries(subscales)) {
      scores[subscale] = indices.reduce((sum, index) => sum + (answers[index] || 0), 0);
    }

    return scores;
  };

  const handleSubmit = () => {
    if (answers.includes(null)) {
      toast({
        title: "Incomplete",
        description: "Please answer all questions before submitting.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const totalScore = answers.reduce((acc, curr) => acc + (curr || 0), 0);
    const subScores = calculateSubscaleScores(answers);

    setScore(totalScore);
    setSubscaleScores(subScores);
  };

  const getScoreSeverity = (totalScore: number): string => {
    if (totalScore < 14) return "Minimal OCD symptoms";
    if (totalScore < 21) return "Mild OCD symptoms";
    if (totalScore < 28) return "Moderate OCD symptoms";
    if (totalScore < 35) return "Moderate-severe OCD symptoms";
    return "Severe OCD symptoms";
  };


  return (
    <Box maxW="60%" mx="auto" p={6}>
      <Heading mb={8} textAlign="center" color="#045B64">
        Instructions
      </Heading>

      <Text mb={6}>
        The following statements refer to experiences that many people have in their everyday lives. Rate how much each experience has <strong>distressed or bothered you during the past month</strong>.

      </Text>

      {questions.map((question, index) => (
        <Box key={index} mb={6} p={6} borderWidth="1px" rounded="xl" shadow="base">
          <Text fontSize="md" fontWeight="semibold" mb={4}>
            {index + 1}. {question}
          </Text>
          <RadioGroup
            onChange={(value) => handleOptionChange(index, value)}
            value={answers[index]?.toString()}
          >
            <Grid gap={4} templateColumns={{ base: '1fr', md: 'repeat(5, 1fr)' }}>
              {options.map((optionText, optionIndex) => (
                <Radio
                  key={optionIndex}
                  value={optionIndex.toString()}
                  colorScheme="teal"
                  size="md"
                  _checked={{ bg: "#045B64", color: "white", borderColor: "#045B64" }}
                >
                  {optionText}
                </Radio>
              ))}
            </Grid>
          </RadioGroup>
        </Box>
      ))}

      <Button
        colorScheme="teal"
        size="lg"
        width="100%"
        bg="#045B64"
        _hover={{ bg: "#033f45" }}
        onClick={handleSubmit}
      >
        Submit
      </Button>

      {score !== null && (
        <Box mt={8} p={6} borderWidth="1px" rounded="md" shadow="md">
          <Heading size="md" mb={4} color="#045B64" textAlign="center">
            Your Total Score: {score}
          </Heading>
          <Text fontSize="lg" fontWeight="bold" textAlign="center" mb={4}>
            {getScoreSeverity(score)}
          </Text>

          <Box p={4} bg="white" rounded="md">
            <Heading size="sm" mb={3} color="#045B64">
              Symptom Dimension Scores:
            </Heading>
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
              {subscaleScores && Object.entries(subscaleScores).map(([dimension, dimensionScore]) => (
                <Box key={dimension} p={3} borderWidth="1px" rounded="md">
                  <Text fontWeight="medium">{dimension}: {dimensionScore}/12</Text>
                </Box>
              ))}
            </Grid>
          </Box>

          <Box mt={6} textAlign="left">
            <Text fontSize="sm" fontStyle="italic">
              Scoring interpretation:
            </Text>
            <Text fontSize="sm">0-13: Minimal OCD symptoms</Text>
            <Text fontSize="sm">14-20: Mild OCD symptoms</Text>
            <Text fontSize="sm">21-27: Moderate OCD symptoms (clinical cutoff score: 21)</Text>
            <Text fontSize="sm">28-34: Moderate-severe OCD symptoms</Text>
            <Text fontSize="sm">35+: Severe OCD symptoms</Text>
            <Text mt={2} fontSize="sm" fontWeight="medium">
              Note: This is a screening tool only. A score of 21 or higher suggests possible OCD, but a proper diagnosis requires evaluation by a qualified mental health professional.
            </Text>
          </Box>
        </Box>
      )}
    </Box>
  );
}