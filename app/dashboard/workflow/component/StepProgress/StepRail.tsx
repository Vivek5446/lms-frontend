import { Box, Flex, HStack, Text, Icon, Tooltip } from "@chakra-ui/react";
import { CheckCircleIcon } from "@chakra-ui/icons";

interface StepRailProps {
  steps: { id: string; label: string; icon: any }[];
  activeIndex: number;
  completedMap: boolean[];
  onStepClick: (index: number) => void;
}

const StepRail = ({ steps, activeIndex, completedMap, onStepClick }: StepRailProps) => {
  return (
    <Flex
      px={6}
      py={4}
      bg="white"
      borderBottom="1px solid"
      borderColor="gray.200"
      align="center"
      overflowX="auto"
      gap={6}
    >
      {steps.map((step, index) => {
        const isActive = index === activeIndex;
        const isCompleted = completedMap[index];
        const isLocked = index > activeIndex + 1;

        return (
          <Tooltip key={step.id} label={step.label} placement="bottom">
            <Flex
              align="center"
              gap={2}
              cursor={isLocked ? "not-allowed" : "pointer"}
              opacity={isLocked ? 0.4 : 1}
              onClick={() => !isLocked && onStepClick(index)}
              transition="all 0.2s"
              _hover={{ transform: !isLocked ? "translateY(-1px)" : "none" }}
            >
              <Box
                w="36px"
                h="36px"
                rounded="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
                bg={
                  isActive
                    ? "blue.500"
                    : isCompleted
                    ? "green.400"
                    : "gray.100"
                }
                color={isActive || isCompleted ? "white" : "gray.500"}
              >
                {isCompleted ? <CheckCircleIcon /> : <Icon as={step.icon} />}
              </Box>

              <Text
                fontSize="sm"
                fontWeight={isActive ? "600" : "400"}
                color={isActive ? "gray.800" : "gray.500"}
                whiteSpace="nowrap"
              >
                {step.label}
              </Text>
            </Flex>
          </Tooltip>
        );
      })}
    </Flex>
  );
};

export default StepRail;