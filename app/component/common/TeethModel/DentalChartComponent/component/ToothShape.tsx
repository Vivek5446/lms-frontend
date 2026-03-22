// import { ToothData } from "@/data/teethData";
import { Box, Text } from "@chakra-ui/react";
import { ToothData } from "../utils/teethData";

interface ToothShapeProps {
  tooth: ToothData;
  isSelected: boolean;
  onClick: () => void;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: { w: "32px", h: "48px" },
  md: { w: "40px", h: "56px" },
  lg: { w: "48px", h: "64px" },
};

export const ToothShape = ({
  tooth,
  isSelected,
  onClick,
  size = "md",
}: ToothShapeProps) => {
  const getToothPath = () => {
    switch (tooth.type) {
      case "molar":
        return tooth.position === "upper"
          ? "M8 4C4 4 2 8 2 14C2 20 4 24 8 26C12 28 16 28 20 26C24 24 26 20 26 14C26 8 24 4 20 4C16 4 12 4 8 4Z"
          : "M8 2C4 4 2 8 2 14C2 20 4 22 8 24C12 26 16 26 20 24C24 22 26 20 26 14C26 8 24 4 20 2C16 0 12 0 8 2Z";

      case "premolar":
        return tooth.position === "upper"
          ? "M10 4C6 4 4 8 4 14C4 20 6 24 10 26C14 28 18 26 22 24C24 20 24 14 22 8C20 4 16 4 10 4Z"
          : "M10 2C6 4 4 8 4 14C4 20 6 22 10 24C14 26 18 24 22 22C24 18 24 12 22 6C20 2 16 2 10 2Z";

      case "canine":
        return tooth.position === "upper"
          ? "M14 2C10 2 6 6 6 12C6 18 8 24 14 28C20 24 22 18 22 12C22 6 18 2 14 2Z"
          : "M14 0C10 2 6 6 6 12C6 18 8 22 14 26C20 22 22 18 22 12C22 6 18 0 14 0Z";

      case "incisor":
      default:
        return tooth.position === "upper"
          ? "M12 2C8 2 6 6 6 12C6 18 8 24 12 28C16 24 18 18 18 12C18 6 16 2 12 2Z"
          : "M12 0C8 2 6 6 6 12C6 18 8 22 12 26C16 22 18 18 18 12C18 6 16 0 12 0Z";
    }
  };

  return (
    <Box
      as="button"
      onClick={onClick}
      display="flex"
      flexDir="column"
      alignItems="center"
      gap={1}
      p={1}
      rounded="lg"
      transition="all 0.2s"
      bg={isSelected ? "blue.50" : "transparent"}
      _hover={{ bg: "gray.100" }}
    >
      <Box
        as="svg"
        viewBox="0 0 28 30"
        width={sizeMap[size].w}
        height={sizeMap[size].h}
        transition="all 0.2s"
      >
        <path
          d={getToothPath()}
          fill={isSelected ? "#BEE3F8" : "#EDF2F7"}
          stroke={isSelected ? "#3182CE" : "#CBD5E0"}
          strokeWidth={isSelected ? 2 : 1}
          style={{ transition: "all 0.2s" }}
        />

        <text
          x="14"
          y="16"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="8"
          fontWeight="600"
          fill={isSelected ? "#3182CE" : "#4A5568"}
          pointerEvents="none"
        >
          {tooth.fdi}
        </text>
      </Box>

      <Text
        fontSize="10px"
        fontWeight="medium"
        color={isSelected ? "blue.600" : "gray.500"}
        transition="color 0.2s"
      >
        {tooth.fdi}
      </Text>
    </Box>
  );
};
