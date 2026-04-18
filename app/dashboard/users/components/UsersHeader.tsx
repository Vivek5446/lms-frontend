"use client";

import { Box, Button, Flex, HStack, Text } from "@chakra-ui/react";

type Props = {
  onOpenBulk: () => void;
  onOpenCreate: () => void;
  borderColor: string;
  muted: string;
};

const UsersHeader = ({
  onOpenBulk,
  onOpenCreate,
  borderColor,
  muted,
}: Props) => {
  return (
    <Box
      bg="white"
      borderRadius="2xl"
      borderWidth="1px"
      borderColor={borderColor}
      p={{ base: 5, md: 6 }}
      boxShadow="sm"
    >
      <Flex
        justify="space-between"
        align={{ base: "start", md: "center" }}
        direction={{ base: "column", md: "row" }}
        gap={4}
      >
        <Box>
          <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold">
            Users Management
          </Text>
          <Text color={muted} mt={1}>
            Manage users, managers, hierarchy and onboarding
          </Text>
        </Box>

        <HStack
          spacing={3}
          alignSelf={{ base: "stretch", md: "auto" }}
          flexWrap="wrap"
          justify={{ base: "stretch", md: "flex-end" }}
        >
          <Button colorScheme="purple" variant="outline" onClick={onOpenBulk}>
            Excel Upload
          </Button>
          <Button colorScheme="blue" onClick={onOpenCreate}>
            Add User
          </Button>
        </HStack>
      </Flex>
    </Box>
  );
};

export default UsersHeader;
