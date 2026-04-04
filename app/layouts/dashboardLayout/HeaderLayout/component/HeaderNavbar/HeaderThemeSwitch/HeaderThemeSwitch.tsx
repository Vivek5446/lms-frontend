"use client";

import { useEffect, useState } from "react";
import { IconButton, useColorMode } from "@chakra-ui/react";
import { BiMoon, BiSun } from "react-icons/bi";

const HeaderThemeSwitch = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(
    typeof window !== "undefined" ? colorMode === "dark" : false
  );

  useEffect(() => {
    setIsDarkMode(colorMode === "dark");
  }, [colorMode]);

  const toggleMode = () => {
    toggleColorMode();
    setIsDarkMode(!isDarkMode);
  };

  return (
    <IconButton
      icon={isDarkMode ? <BiSun /> : <BiMoon />}
      onClick={toggleMode}
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      fontSize="xl"
      color="white"
      bg="gray.700"
      borderRadius="full"
      w="40px"
      h="40px"
      minW="40px"
      _hover={{ bg: "blue.500", transform: "scale(1.05)" }}
      _active={{ bg: "blue.600", transform: "scale(0.97)" }}
      transition="all 0.2s ease"
    />
  );
};

export default HeaderThemeSwitch;