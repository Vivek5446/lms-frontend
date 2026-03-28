// import { ToothData, DentitionType, getTeethByType } from "@/data/teethData";
// import { ToothShape } from "./ToothShape";
import {
    Box,
    Flex,
    HStack,
    Text,
    VStack
} from "@chakra-ui/react";
import { DentitionType, getTeethByType, ToothData } from "../utils/teethData";
import { ToothShape } from "./ToothShape";

interface TeethChartProps {
  dentitionType: DentitionType;
  selectedTooth: ToothData | null;
  onToothClick: (tooth: ToothData) => void;
}

export const TeethChart = ({
  dentitionType,
  selectedTooth,
  onToothClick,
}: TeethChartProps) => {
  const teeth = getTeethByType(dentitionType);

  const upperRightTeeth = teeth.filter(
    (t) => t.position === "upper" && t.side === "right"
  );
  const upperLeftTeeth = teeth.filter(
    (t) => t.position === "upper" && t.side === "left"
  );
  const lowerLeftTeeth = teeth.filter(
    (t) => t.position === "lower" && t.side === "left"
  );
  const lowerRightTeeth = teeth.filter(
    (t) => t.position === "lower" && t.side === "right"
  );

  const renderTeethRow = (rowTeeth: ToothData[], reverse = false) => {
    const sorted = reverse ? [...rowTeeth].reverse() : rowTeeth;

    return sorted.map((tooth) => (
      <ToothShape
        key={tooth.id}
        tooth={tooth}
        isSelected={selectedTooth?.id === tooth.id}
        onClick={() => onToothClick(tooth)}
        size="md"
      />
    ));
  };

  return (
    <Box
      position="relative"
      bg="white"
      rounded="2xl"
      p={6}
      borderWidth={1}
      boxShadow="md"
    >
      {/* Labels */}
      <Text
        position="absolute"
        top={4}
        left={4}
        fontSize="xs"
        fontWeight="semibold"
        color="gray.500"
        textTransform="uppercase"
        letterSpacing="wider"
      >
        Patient&apos;s Right
      </Text>

      <Text
        position="absolute"
        top={4}
        right={4}
        fontSize="xs"
        fontWeight="semibold"
        color="gray.500"
        textTransform="uppercase"
        letterSpacing="wider"
      >
        Patient&apos;s Left
      </Text>

      <VStack spacing={2} pt={8}>
        {/* Upper Jaw */}
        <Box position="relative">
          <Text
            position="absolute"
            left="-64px"
            top="50%"
            transform="translateY(-50%) rotate(-90deg)"
            fontSize="xs"
            fontWeight="medium"
            color="gray.500"
          >
            Upper Jaw
          </Text>

          <Flex align="flex-end" justify="center" gap={1}>
            {/* Upper Right */}
            <Flex align="flex-end">
              {renderTeethRow(upperRightTeeth)}
            </Flex>

            {/* Divider */}
            <Box w="1px" h="64px" bg="gray.200" mx={2} />

            {/* Upper Left */}
            <Flex align="flex-end">
              {renderTeethRow(upperLeftTeeth)}
            </Flex>
          </Flex>
        </Box>

        {/* Bite line */}
        <Box
          w="100%"
          maxW="2xl"
          h="2px"
          my={4}
          bgGradient="linear(to-r, transparent, gray.300, transparent)"
        />

        {/* Lower Jaw */}
        <Box position="relative">
          <Text
            position="absolute"
            left="-64px"
            top="50%"
            transform="translateY(-50%) rotate(-90deg)"
            fontSize="xs"
            fontWeight="medium"
            color="gray.500"
          >
            Lower Jaw
          </Text>

          <Flex align="flex-start" justify="center" gap={1}>
            {/* Lower Right */}
            <Flex align="flex-start">
              {renderTeethRow(lowerRightTeeth, true)}
            </Flex>

            {/* Divider */}
            <Box w="1px" h="64px" bg="gray.200" mx={2} />

            {/* Lower Left */}
            <Flex align="flex-start">
              {renderTeethRow(lowerLeftTeeth, true)}
            </Flex>
          </Flex>
        </Box>
      </VStack>

      {/* Legend */}
      <Box mt={8} pt={4} borderTop="1px solid" borderColor="gray.200">
        <Flex
          wrap="wrap"
          justify="center"
          gap={6}
          fontSize="xs"
          color="gray.500"
        >
          <HStack spacing={2}>
            <Box
              w={3}
              h={3}
              rounded="full"
              bg="gray.100"
              border="1px solid"
              borderColor="gray.300"
            />
            <Text>Available</Text>
          </HStack>

          <HStack spacing={2}>
            <Box
              w={3}
              h={3}
              rounded="full"
              bg="blue.100"
              border="1px solid"
              borderColor="blue.500"
            />
            <Text>Selected</Text>
          </HStack>
        </Flex>
      </Box>
    </Box>
  );
};
