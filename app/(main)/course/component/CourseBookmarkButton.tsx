"use client";

import {
  Icon,
  IconButton,
  Tooltip,
  useColorModeValue,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { FiBookmark } from "react-icons/fi";

const MotionIconButton = motion(IconButton);

interface CourseBookmarkButtonProps {
  isBookmarked?: boolean;
  isLoading?: boolean;
  onToggle: () => void;
  size?: "sm" | "md";
}

export default function CourseBookmarkButton({
  isBookmarked = false,
  isLoading = false,
  onToggle,
  size = "md",
}: CourseBookmarkButtonProps) {
  const inactiveBg = useColorModeValue("whiteAlpha.900", "blackAlpha.500");
  const activeBg = useColorModeValue("rose.500", "rose.400");
  const inactiveColor = useColorModeValue("gray.700", "whiteAlpha.900");
  const activeColor = "white";

  return (
    <Tooltip label={isBookmarked ? "Remove bookmark" : "Save course"} hasArrow>
      <MotionIconButton
        aria-label={isBookmarked ? "Remove bookmark" : "Save course"}
        icon={
          <Icon
            as={FiBookmark}
            boxSize={size === "sm" ? 4 : 5}
            fill={isBookmarked ? "currentColor" : "transparent"}
          />
        }
        size={size}
        minW={size === "sm" ? "34px" : "38px"}
        h={size === "sm" ? "34px" : "38px"}
        borderRadius="full"
        bg={isBookmarked ? activeBg : inactiveBg}
        color={isBookmarked ? activeColor : inactiveColor}
        borderWidth="1px"
        borderColor={isBookmarked ? "transparent" : "whiteAlpha.800"}
        boxShadow={isBookmarked ? "0 10px 22px rgba(244, 63, 94, 0.28)" : "0 8px 20px rgba(15, 23, 42, 0.14)"}
        backdropFilter="blur(10px)"
        isLoading={isLoading}
        isDisabled={isLoading}
        onClick={(event) => {
          event.stopPropagation();
          onToggle();
        }}
        whileTap={{ scale: 0.86 }}
        animate={{ scale: isBookmarked ? [1, 1.18, 1] : 1 }}
        transition={{ duration: 0.22 }}
        _hover={{
          bg: isBookmarked ? useColorModeValue("rose.600", "rose.300") : useColorModeValue("white", "gray.700"),
          transform: "translateY(-1px)",
        }}
      />
    </Tooltip>
  );
}
