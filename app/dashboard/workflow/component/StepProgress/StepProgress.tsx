import { Box, Flex, Text, Progress } from "@chakra-ui/react";

interface StepProgressProps {
  currentStep: number;   // 1-based
  totalSteps: number;
  currentLabel?: string;
}

const StepProgress = ({ currentStep, totalSteps, currentLabel }: StepProgressProps) => {
  const percent = Math.round((currentStep / totalSteps) * 100);

  return (
    <Box mb={6}>
      <Flex justify="space-between" align="center" mb={2}>
        <Text fontSize="sm" fontWeight="medium">
          Step {currentStep} / {totalSteps}
          {currentLabel ? ` — ${currentLabel}` : ""}
        </Text>
        <Text fontSize="xs" color="gray.500">
          {percent}%
        </Text>
      </Flex>

      <Progress
        value={percent}
        size="sm"
        colorScheme="blue"
        rounded="full"
      />
    </Box>
  );
};

export default StepProgress;