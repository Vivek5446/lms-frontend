"use client";

import { Box, Button, Flex, HStack, Text, Icon, Badge, useColorModeValue, Heading } from "@chakra-ui/react";
import { FiUpload, FiUserPlus, FiUsers, FiShield, FiBriefcase, FiArrowLeft } from "react-icons/fi";

type Props = {
  onOpenBulk: () => void;
  onOpenCreate: () => void;
  borderColor: string;
  muted: string;
  canOpenBulk?: boolean;
  canOpenCreate?: boolean;
  totalUsers?: number;
  activeUsers?: number;
};

const UsersHeader = ({
  onOpenBulk,
  onOpenCreate,
  borderColor,
  muted,
  canOpenBulk = true,
  canOpenCreate = true,
  totalUsers = 0,
  activeUsers = 0,
}: Props) => {
  const bg = useColorModeValue("white", "gray.800");

  return (
    <Box bg={bg} borderWidth="1px" borderColor={borderColor} rounded={{ base: "xl", md: "2xl" }} px={{ base: 4, md: 6 }} py={{ base: 4, md: 5 }} shadow="sm">
      <Flex direction={{ base: "column", md: "row" }} justify="space-between" align={{ base: "flex-start", md: "center" }} gap={4}>
        <HStack spacing={{ base: 3, md: 4 }} align="center">
          <Box 
            as="button"
            onClick={() => window.history.back()}
            color={useColorModeValue("gray.500", "gray.400")}
            bg={useColorModeValue("gray.100", "whiteAlpha.100")}
            w={{ base: "36px", md: "40px" }} h={{ base: "36px", md: "40px" }}
            rounded="full"
            flexShrink={0}
            display="flex"
            alignItems="center"
            justifyContent="center"
            _hover={{ bg: useColorModeValue("gray.200", "whiteAlpha.200"), color: "#6269FF", transform: "translateX(-3px)" }}
            transition="all 0.2s"
          >
            <FiArrowLeft size={18} />
          </Box>
          <Box display={{ base: "none", md: "flex" }} p={{ base: 2.5, md: 3 }} bgGradient="linear(to-br, #6269FF, #8A2BE2)" rounded="full" alignItems="center" justifyContent="center" boxShadow="0 4px 15px rgba(98,105,255,0.4)" border="1px solid" borderColor="rgba(255,255,255,0.2)">
            <Icon as={FiUsers} boxSize={{ base: 4, md: 5 }} color="white" />
          </Box>
          <Box>
            <Heading size={{ base: "sm", md: "lg" }} fontWeight="900" letterSpacing="tight" lineHeight="1.2">
              <Box as="span" color={useColorModeValue("gray.900", "white")}>USERS </Box>
              <Box as="span" bgGradient={useColorModeValue("linear(to-r, purple.500, purple.700)", "linear(to-r, purple.300, purple.500)")} bgClip="text">
                MANAGEMENT
              </Box>
            </Heading>
            <Text mt={1} fontSize={{ base: "2xs", md: "xs" }} fontWeight="700" color={useColorModeValue("gray.500", "gray.400")} letterSpacing="0.1em" textTransform="uppercase" noOfLines={1}>
              Manage users, managers, hierarchy and onboarding
            </Text>
          </Box>
        </HStack>
        <Badge bg={useColorModeValue("blue.50", "rgba(98,105,255,0.15)")} color="#6269FF" borderRadius="full" px={4} py={2} fontSize="xs" fontWeight="800">
          <Flex align="center" gap={1.5}>
            <Icon as={FiShield} boxSize={3.5} />
            ADMINISTRATION SCOPE
          </Flex>
        </Badge>
      </Flex>
    </Box>
  );
};

export default UsersHeader;
