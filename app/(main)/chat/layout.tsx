"use client";

import { Flex, useColorModeValue } from "@chakra-ui/react";
import { usePathname } from "next/navigation";
import CommunitySidebar from "./components/CommunitySidebar";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const bgMain = useColorModeValue("white", "gray.900");
  
  // On mobile, if we are deeper than /chat, hide this sidebar.
  // On desktop, always show it.
  const isExactRoot = pathname === "/chat";

  return (
    <Flex h={{ base: "100vh", md: "calc(100vh - 64px)" }} w="full" bg={bgMain} overflow="hidden">
      <Flex display={{ base: isExactRoot ? "flex" : "none", md: "flex" }} w={{ base: "full", md: "auto" }}>
        <CommunitySidebar />
      </Flex>
      {children}
    </Flex>
  );
}
