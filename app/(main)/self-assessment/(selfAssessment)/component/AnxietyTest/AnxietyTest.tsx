import { Box, Button, Grid, Heading, Radio, RadioGroup, Text, useToast } from "@chakra-ui/react";
import { useState } from "react";


// Beck Anxiety Inventory (BAI)

const symptoms = [
  "Numbness or tingling",
  "Feeling hot",
  "Wobbliness in legs",
  "Unable to relax",
  "Fear of worst happening",
  "Dizzy or lightheaded",
  "Heart pounding / racing",
  "Unsteady",
  "Terrified or afraid",
  "Nervous",
  "Feeling of choking",
  "Hands trembling",
  "Shaky / unsteady",
  "Fear of losing control",
  "Difficulty in breathing",
  "Fear of dying",
  "Scared",
  "Indigestion",
  "Faint / lightheaded",
  "Face flushed",
  "Hot / cold sweats",
];

const options = [
  "Not at all",
  "Mildly, but it didn’t bother me much",
  "Moderately – it wasn’t pleasant at times",
  "Severely – it bothered me a lot",
];

export default function AnxietyInventory() {
  const [answers, setAnswers] = useState(Array(symptoms.length).fill(null));
  const [score, setScore] = useState(null);
  const toast = useToast();

  const handleOptionChange = (symptomIndex, value) => {
    const newAnswers = [...answers];
    newAnswers[symptomIndex] = parseInt(value);
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    if (answers.includes(null)) {
      toast({
        title: "Incomplete",
        description: "Please answer all symptoms before submitting.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    const totalScore = answers.reduce((acc, curr) => acc + curr, 0);
    setScore(totalScore);
  };

  const interpretScore = (score) => {
    if (score <= 21) {
      return "Low anxiety: Your score suggests that you're experiencing low levels of anxiety or only mild symptoms. While it’s normal to feel anxious at times, your results indicate that anxiety is not significantly affecting your daily life.";
    }
    if (score <= 35) {
      return "Moderate anxiety: Your score indicates moderate anxiety, meaning you may be experiencing noticeable symptoms that could be impacting your daily activities, relationships, or work. It's recommended to consider talking to a therapist who can help you explore strategies to manage and reduce anxiety effectively.";
    }
    return "Potentially concerning levels of anxiety: Your score indicates that anxiety is having a significant impact on your life. These high levels of anxiety may be affecting your ability to function in different areas. It's important to seek professional support from a therapist or psychiatrist to address these symptoms, as treatment can help manage and reduce anxiety.";
  };



  return (
    <Box maxW="60%" mx="auto" p={6}>
      <Heading mb={8} textAlign="center" color="#045B64">
        Instructions
      </Heading>
      <Text textAlign="center" mb={8} color="gray.600">
        Below are a common symptoms of anxiety. Please carefully read and indicate how much you have been bothered by that symptom during the past month, including today.
      </Text>

      {symptoms.map((symptom, index) => (
        <Box key={index} mb={6} p={8} borderWidth="1px" rounded="2xl" shadow="base">
          <Text fontSize="md" fontWeight="semibold" mb={4}>
            {index + 1}. {symptom}
          </Text>
          <RadioGroup
            onChange={(value) => handleOptionChange(index, value)}
            value={answers[index]?.toString()}
          >
            <Grid gap={6} templateColumns={'1fr 1fr'}>
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
        <Box mt={8} p={6} borderWidth="1px" rounded="md" shadow="md" textAlign="center" bg="#f0f4f5">
          <Heading size="md" mb={4} color="#045B64">
            Your Total Score: {score}
          </Heading>
          <Text fontSize="lg">{interpretScore(score)}</Text>
        </Box>
      )}
    </Box>
  );
}
