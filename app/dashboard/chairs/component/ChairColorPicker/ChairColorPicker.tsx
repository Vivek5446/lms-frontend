"use client";

import { CheckIcon, EditIcon } from "@chakra-ui/icons";
import {
    Box,
    Flex,
    Popover,
    PopoverArrow,
    PopoverBody,
    PopoverCloseButton,
    PopoverContent,
    PopoverTrigger,
    Text,
    useDisclosure
} from "@chakra-ui/react";
import { ChromePicker } from "react-color";

// const BASIC_COLORS = [
//   "#000000", "#FF0000", "#008000", "#0000FF", "#FFC107",
//   "#800080", "#FF69B4", "#795548", "#607D8B", "#FFFFFF",
// ];
const BASIC_COLORS = [
  "#F6E05E",
  "#0D47A1", // Royal Blue (Classic Dental)
  "#00897B", // Teal (Surgical/Medical)
  "#42A5F5", // Sky Blue (Calming/Pediatric)
  "#66BB6A", // Mint Green (Freshness)
  "#8D6E63", // Taupe/Beige (Leather/Neutral)
  "#546E7A", // Slate Grey (Modern/Sleek)
  "#880E4F", // Burgundy (Premium/Deep)
  "#7B1FA2", // Plum/Purple (Vibrant but deep)
  "#263238", // Charcoal Black (Professional)
  "#E53E3E",
  "#DD6B20",
  "#FAFAFA", // Sterile White (Clean)
];
interface ChairColorPickerProps {
  value: string;
  onChange: any;
}

const ChairColorPicker = ({ value, onChange }: ChairColorPickerProps) => {
  const { onOpen, onClose, isOpen } = useDisclosure();

  return (
    <Box
      p={4}
      border="1px solid"
      borderColor="gray.200"
      borderRadius="xl"
      bg="white"
      shadow="sm"
    >
      <Flex justify="space-between" align="center" mb={4}>
        <Text fontSize="md" fontWeight="bold" color="gray.700">
          Chair Color
        </Text>
        <Text fontSize="xs" color="gray.500" fontWeight="medium" textTransform="uppercase">
          {value || "Select"}
        </Text>
      </Flex>

      {/* Preset Colors Grid */}
      <Flex wrap="wrap" gap={3} mb={5}>
        {BASIC_COLORS.map((col, index : number) => {
          const isSelected = value?.toLowerCase() === col.toLowerCase();
          return (
              <Box
                as="button"
                type="button"  // <--- 🔴 IMPORTANT: PREVENTS FORM SUBMISSION
                w="36px"
                h="36px"
                borderRadius="full"
                bg={col}
                key={index}
                border="1px solid"
                borderColor="gray.200"
                position="relative"
                onClick={() => onChange(col)}
                _hover={{ transform: "scale(1.1)" }}
                transition="all 0.2s"
                boxShadow={isSelected ? "0 0 0 2px white, 0 0 0 4px #3182ce" : "inset 0 0 0 1px rgba(0,0,0,0.1)"}
              >
                {isSelected && (
                  <Flex align="center" justify="center" h="100%" w="100%">
                    <CheckIcon color={col === "#FFFFFF" ? "black" : "white"} boxSize={3} />
                  </Flex>
                )}
              </Box>
          );
        })}

        {/* Custom Color Gradient Trigger */}
        <Popover isOpen={isOpen} onOpen={onOpen} onClose={onClose} placement="right-start">
          <PopoverTrigger>
            <Box
              as="button"
              type="button" // <--- 🔴 IMPORTANT: PREVENTS FORM SUBMISSION
              w="36px"
              h="36px"
              borderRadius="full"
              bgGradient="linear(to-tr, red.400, yellow.400, green.400, blue.400)"
              display="flex"
              alignItems="center"
              justifyContent="center"
              _hover={{ transform: "scale(1.1)", shadow: "md" }}
              transition="all 0.2s"
              aria-label="Custom Color"
            >
              <EditIcon color="white" boxSize={3} />
            </Box>
          </PopoverTrigger>
          <PopoverContent w="auto" border="none" shadow="xl">
            <PopoverArrow />
            <PopoverCloseButton color="white" zIndex={10} />
            <PopoverBody p={0} borderRadius="md" overflow="hidden">
              <ChromePicker
                color={value || "#000000"}
                onChange={(color) => onChange(color.hex)}
                disableAlpha
              />
            </PopoverBody>
          </PopoverContent>
        </Popover>
      </Flex>
    </Box>
  );
};

export default ChairColorPicker;