"use client";

import { Box, Button, Flex, HStack, Text, Icon, Badge } from "@chakra-ui/react";
import { FiUpload, FiUserPlus, FiUsers, FiShield } from "react-icons/fi";

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
  return (
    <Box
      bg="white"
      borderRadius="2xl"
      borderWidth="1px"
      borderColor={borderColor}
      position="relative"
      overflow="hidden"
      boxShadow="lg"
      transition="all 0.2s"
      _hover={{ boxShadow: "xl" }}
    >
      {/* Decorative gradient bar at the top */}
      <Box
        h="1"
        bgGradient="linear(to-r, blue.400, purple.500, pink.400)"
        position="absolute"
        top="0"
        left="0"
        right="0"
      />

      <Box p={{ base: 5, md: 6 }}>
        <Flex
          justify="space-between"
          align={{ base: "start", md: "center" }}
          direction={{ base: "column", md: "row" }}
          gap={6}
        >
          {/* Left Section - Title & Stats */}
          <Box flex="1">
            <Flex align="center" gap={3} mb={2} flexWrap="wrap">
              <Flex
                align="center"
                justify="center"
                bg="blue.50"
                p={2}
                borderRadius="xl"
              >
                <Icon as={FiUsers} boxSize={6} color="blue.600" />
              </Flex>
              <Box>
                <Text
                  fontSize={{ base: "2xl", md: "3xl" }}
                  fontWeight="extrabold"
                  bgGradient="linear(to-r, blue.600, purple.600)"
                  bgClip="text"
                >
                  Users Management
                </Text>
                <Text color={muted} fontSize="sm" mt={1}>
                  Manage users, managers, hierarchy and onboarding
                </Text>
              </Box>
            </Flex>

            {/* Stats Section */}
            {(totalUsers > 0 || activeUsers > 0) && (
              <HStack spacing={4} mt={3} ml={12}>
                {totalUsers > 0 && (
                  <Flex align="center" gap={2}>
                    <Icon as={FiUsers} boxSize={4} color="gray.500" />
                    <Text fontSize="sm" color={muted}>
                      Total:{" "}
                      <Text as="span" fontWeight="bold" color="gray.700">
                        {totalUsers}
                      </Text>
                    </Text>
                  </Flex>
                )}
                {activeUsers > 0 && (
                  <Flex align="center" gap={2}>
                    <Box
                      w="2"
                      h="2"
                      bg="green.500"
                      borderRadius="full"
                      boxShadow="0 0 0 2px rgba(72, 187, 120, 0.2)"
                    />
                    <Text fontSize="sm" color={muted}>
                      Active:{" "}
                      <Text as="span" fontWeight="bold" color="gray.700">
                        {activeUsers}
                      </Text>
                    </Text>
                  </Flex>
                )}
                <Badge
                  colorScheme="purple"
                  variant="subtle"
                  borderRadius="full"
                  px={3}
                  py={1}
                  fontSize="xs"
                >
                  <Icon as={FiShield} mr={1} boxSize={3} />
                  Admin Access
                </Badge>
              </HStack>
            )}
          </Box>

          {/* Right Section - Action Buttons */}
          <HStack
            spacing={3}
            alignSelf={{ base: "stretch", md: "auto" }}
            flexWrap="wrap"
            justify={{ base: "stretch", md: "flex-end" }}
            w={{ base: "full", md: "auto" }}
          >
            {canOpenBulk && (
              <Button
                leftIcon={<Icon as={FiUpload} />}
                variant="outline"
                onClick={onOpenBulk}
                size={{ base: "md", md: "lg" }}
                px={{ base: 4, md: 6 }}
                borderWidth="2px"
                borderColor="purple.400"
                color="purple.600"
                _hover={{
                  bg: "purple.50",
                  borderColor: "purple.500",
                  transform: "translateY(-2px)",
                  boxShadow: "md",
                }}
                _active={{ transform: "translateY(0)" }}
                transition="all 0.2s"
                w={{ base: "full", md: "auto" }}
              >
                Excel Upload
              </Button>
            )}

            {canOpenCreate && (
              <Button
                leftIcon={<Icon as={FiUserPlus} />}
                onClick={onOpenCreate}
                size={{ base: "md", md: "lg" }}
                px={{ base: 4, md: 6 }}
                bgGradient="linear(to-r, blue.500, purple.600)"
                color="white"
                _hover={{
                  bgGradient: "linear(to-r, blue.600, purple.700)",
                  transform: "translateY(-2px)",
                  boxShadow: "lg",
                }}
                _active={{ transform: "translateY(0)" }}
                transition="all 0.2s"
                boxShadow="md"
                w={{ base: "full", md: "auto" }}
              >
                Add User
              </Button>
            )}
          </HStack>
        </Flex>
      </Box>
    </Box>
  );
};

export default UsersHeader;