"use client";

import { Flex } from "@chakra-ui/react";
import React, { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Loader from "../../component/common/Loader/Loader";
import stores from "../../store/stores";

// 👉 import your header/footer
import Header from "../../layouts/mainLayout/component/Header/Header";   // adjust path if needed
// import Footer from "../../layouts/mainLayout/component/Footer/Footer";   // adjust path if needed

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  const {
    auth: { user },
  } = stores;

  useEffect(() => {
    if (typeof window !== "undefined") {
      // protect dashboard only
      if (!user && pathname.startsWith("/dashboard")) {
        router.replace("/login");
      }

      setIsChecking(false);
    }
  }, [pathname, router, user]);

  if (isChecking) {
    return (
      <Flex minH="100vh" align="center" justify="center">
        <Loader />
      </Flex>
    );
  }

  return (
    <>
      {/* ✅ Header */}
      <Header />

      {/* ✅ Page Content */}
      <main>{children}</main>

      {/* ✅ Footer */}
      {/* <Footer /> */}
    </>
  );
};

export default MainLayout;