"use client"; // Add this for client-side component in Next.js

import { Flex, useColorMode } from "@chakra-ui/react";
import { useMediaQuery } from "@chakra-ui/react";
import HeaderNavbar from "./component/HeaderNavbar/HeaderNavbar";
import HeaderLogo from "./component/Logo/HeaderLogo";
import HeaderCompanySelector from "./component/CompanySelector/HeaderCompanySelector";
import HeaderWorkflowSelector from "./component/WorkflowSelector/HeaderWorkflowSelector";
import { observer } from "mobx-react-lite";
import { headerHeight, headerPadding } from "../../../component/config/utils/variable";


const HeaderLayout = observer(() => {
  const [isLargerThan1020] = useMediaQuery("(min-width: 1020px)");
  const { colorMode } = useColorMode();

  const isDark = colorMode === "dark";

  return (
    <Flex
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      height={headerHeight}
      padding={headerPadding}
      bg={isDark 
        ? "linear-gradient(135deg, #1a202c 0%, #2d3748 50%, #1e1e2e 100%)" 
        : "linear-gradient(135deg, #ffffff 0%, #f8f9ff 30%, #f0f2ff 80%)"
      }
      borderBottom={isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(99, 102, 241, 0.12)"}
      boxShadow={isDark 
        ? "0 4px 12px rgba(0, 0, 0, 0.3)" 
        : "0 1px 3px rgba(30, 40, 100, 0.06), 0 4px 16px rgba(99, 102, 241, 0.07)"
      }
      color={isDark ? "#e2e8f0" : "#1e2850"}
      transition="all 0.3s ease"
    >
      <Flex width={isLargerThan1020 ? "85%" : "95%"} align="center">
        <HeaderLogo />
        <HeaderCompanySelector />
        <HeaderWorkflowSelector />
      </Flex>
      <HeaderNavbar />
    </Flex>
  );
});

export default HeaderLayout;
