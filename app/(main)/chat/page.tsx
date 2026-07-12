"use client";

import { Flex, Text, useColorModeValue } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";

const ChatRootPage = observer(() => {
  const bgMain = useColorModeValue("gray.50", "gray.900");

  return (
    <Flex flex={1} align="center" justify="center" bg={bgMain} w="full" display={{ base: "none", md: "flex" }}>
      <Text color="gray.500" fontSize="lg">Select a community to view chat rooms</Text>
    </Flex>
  );
});

export default ChatRootPage;
