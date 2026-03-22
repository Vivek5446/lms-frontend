"use client";

import { Flex } from "@chakra-ui/react";
import React, { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Loader from "../../component/common/Loader/Loader";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Only run in browser
    if (typeof window !== "undefined") {
      if (pathname && !pathname.startsWith("/dashboard")) {
        router.replace("/login");
      }
      setIsChecking(false);
    }
  }, [pathname, router]);

  // Show a loading spinner while checking
  if (isChecking) {
    return (
      <Flex minH="100vh" align="center" justify="center">
        <Loader />
      </Flex>
    );
  }

  return null
};

export default MainLayout;
