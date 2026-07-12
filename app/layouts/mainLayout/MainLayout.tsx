"use client";

import { Box, Flex, useColorModeValue } from "@chakra-ui/react";
import { usePathname, useRouter } from "next/navigation";
import React, { ReactNode, useEffect, useState } from "react";
import Loader from "../../component/common/Loader/Loader";
import Header from "../../layouts/mainLayout/component/Header/Header";
import stores from "../../store/stores";
import { Footer } from "./component/Footer/Footer";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const shellBg = useColorModeValue("#F6F8FB", "gray.950");

  const {
    auth: { user, sessionReady },
  } = stores;

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Wait until auth is hydrated from localStorage before deciding to redirect
      if (sessionReady && !user && (pathname.startsWith("/dashboard") || pathname.startsWith("/chat"))) {
        router.replace("/login");
        return;
      }
      // Force Next.js to re-evaluate the layout tree and CSS chunks smoothly
      // This prevents the SPA routing from dropping Chakra UI/Tailwind styles
      router.refresh();
      setIsChecking(false);
    }
  }, [pathname, router, user, sessionReady]);

  if (isChecking) {
    return (
      <Flex minH="100vh" align="center" justify="center">
        <Loader />
      </Flex>
    );
  }

  return (
    <Box minH="100vh" bg={shellBg} overflowX="hidden" pb={{ base: pathname.startsWith("/chat") ? 0 : "92px", md: 0 }}>
      <Box display={{ base: pathname.startsWith("/chat") ? "none" : "block", md: "block" }}>
        <Header />
      </Box>

      <Box as="main" pt={{ base: 0, md: "64px" }}>
        {children}
      </Box>

      {!pathname.startsWith("/chat") && <Footer />}
    </Box>
  );
};

export default MainLayout;
