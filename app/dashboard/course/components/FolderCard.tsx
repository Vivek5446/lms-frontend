"use client";

import {
  Badge,
  Box,
  Flex,
  Icon,
  IconButton,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import React from "react";
import type { IconType } from "react-icons";
import {
  FiArrowUpRight,
  FiEdit3,
  FiTrash2,
} from "react-icons/fi";

const MotionBox = motion(Box);

export interface FolderCardData {
  _id: string;
  name: string;
  description?: string;
  courseCount: number;
  selectionKey: string;
  isVirtual?: boolean;
}

interface FolderIconMeta {
  icon: IconType;
  gradient: string;
  color: string;
  badgeBg: string;
}

interface CourseFolderCardProps {
  folder: FolderCardData;
  iconMeta: FolderIconMeta;
  canManage?: boolean;
  onOpen: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const CourseFolderCard: React.FC<CourseFolderCardProps> = ({
  folder,
  iconMeta,
  canManage = false,
  onOpen,
  onEdit,
  onDelete,
}) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const titleColor = useColorModeValue("gray.800", "white");
  const mutedColor = useColorModeValue("gray.500", "gray.400");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.200");
  const hoverBorderColor = useColorModeValue("blue.300", "blue.400");
  const footerBorderColor = useColorModeValue("gray.100", "whiteAlpha.100");

  const IconComponent = iconMeta.icon;

  const handleCardClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;

    if (target.closest("[data-folder-action]")) {
      return;
    }

    onOpen();
  };

  const handleKeyboardOpen = (
    event: React.KeyboardEvent<HTMLDivElement>,
  ) => {
    if (event.target !== event.currentTarget) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpen();
    }
  };

  const stopCardNavigation = (event: React.SyntheticEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const nativeEvent = "nativeEvent" in event ? event.nativeEvent : null;
    nativeEvent?.stopImmediatePropagation?.();
  };

  return (
    <MotionBox
      role="group"
      tabIndex={0}
      cursor="pointer"
      position="relative"
      overflow="hidden"
      borderRadius="20px"
      border="1px solid"
      borderColor={borderColor}
      bg={cardBg}
      p={{ base: 5, md: 6 }}
      minH="230px"
      display="flex"
      flexDirection="column"
      outline="none"
      animate="border-color 0.2s ease, box-shadow 0.2s ease"
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.99 }}
      onClick={handleCardClick}
      onKeyDown={handleKeyboardOpen}
      _hover={{
        borderColor: hoverBorderColor,
        boxShadow: "0 14px 35px rgba(0, 0, 0, 0.08)",
      }}
      _focusVisible={{
        borderColor: hoverBorderColor,
        boxShadow: "0 0 0 3px rgba(66, 153, 225, 0.25)",
      }}
      aria-label={`Open ${folder.name} folder`}
    >
      {/* Subtle decorative glow */}
      <Box
        position="absolute"
        top="-55px"
        right="-55px"
        w="140px"
        h="140px"
        borderRadius="full"
        bgGradient={iconMeta.gradient}
        opacity={0.08}
        pointerEvents="none"
      />

      <Flex
        justify="space-between"
        align="flex-start"
        position="relative"
        zIndex={1}
      >
        <Flex
          w="50px"
          h="50px"
          flexShrink={0}
          align="center"
          justify="center"
          borderRadius="15px"
          bgGradient={iconMeta.gradient}
          boxShadow="0 8px 20px rgba(0, 0, 0, 0.10)"
          transition="transform 0.2s ease"
          _groupHover={{
            transform: "rotate(-3deg) scale(1.04)",
          }}
        >
          <Icon as={IconComponent} boxSize={5} color={iconMeta.color} />
        </Flex>

        <Flex align="center" gap={1}>
          <Badge
            px={2.5}
            py={1}
            borderRadius="full"
            bg={iconMeta.badgeBg}
            color={iconMeta.color}
            fontSize="10px"
            fontWeight="700"
            textTransform="uppercase"
            letterSpacing="0.03em"
          >
            {folder.courseCount}{" "}
            {folder.courseCount === 1 ? "Course" : "Courses"}
          </Badge>

          {canManage && (
            <Flex align="center" gap={1}>
              <IconButton
                data-folder-action
                size="sm"
                variant="ghost"
                borderRadius="full"
                aria-label={`Edit ${folder.name}`}
                icon={<FiEdit3 size={16} />}
                colorScheme="blue"
                onMouseDown={stopCardNavigation}
                onClick={(event) => {
                  stopCardNavigation(event);
                  onEdit?.();
                }}
              />
              <IconButton
                data-folder-action
                size="sm"
                variant="ghost"
                borderRadius="full"
                aria-label={`Delete ${folder.name}`}
                icon={<FiTrash2 size={16} />}
                colorScheme="red"
                onMouseDown={stopCardNavigation}
                onClick={(event) => {
                  stopCardNavigation(event);
                  onDelete?.();
                }}
              />
            </Flex>
          )}
        </Flex>
      </Flex>

      <Box mt={5} position="relative" zIndex={1}>
        <Text
          fontWeight="700"
          fontSize={{ base: "md", md: "lg" }}
          color={titleColor}
          lineHeight="1.3"
          noOfLines={1}
        >
          {folder.name}
        </Text>

        <Text
          mt={2}
          fontSize="sm"
          lineHeight="1.65"
          color={mutedColor}
          noOfLines={2}
        >
          {folder.description || `Browse courses available in ${folder.name}.`}
        </Text>
      </Box>

      <Flex
        mt="auto"
        pt={4}
        borderTop="1px solid"
        borderColor={footerBorderColor}
        align="center"
        justify="space-between"
        position="relative"
        zIndex={1}
      >
        <Text
          fontSize="sm"
          fontWeight="600"
          color={mutedColor}
          transition="color 0.2s ease"
          _groupHover={{ color: "blue.500" }}
        >
          View courses
        </Text>

        <Flex
          w="32px"
          h="32px"
          align="center"
          justify="center"
          borderRadius="full"
          color="blue.500"
          bg={useColorModeValue("blue.50", "whiteAlpha.100")}
          transition="transform 0.2s ease"
          _groupHover={{
            transform: "translate(2px, -2px)",
          }}
        >
          <FiArrowUpRight size={16} />
        </Flex>
      </Flex>
    </MotionBox>
  );
};

export default CourseFolderCard;
