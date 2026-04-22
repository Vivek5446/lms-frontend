"use client";

import { useEffect, useState } from "react";
import { IconButton, useColorMode } from "@chakra-ui/react";
import { BiMoon, BiSun } from "react-icons/bi";

const HeaderThemeSwitch = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(
    typeof window !== "undefined" ? colorMode === "dark" : false
  );
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setIsDarkMode(colorMode === "dark");
  }, [colorMode]);

  const toggleMode = () => {
    toggleColorMode();
    setIsDarkMode(!isDarkMode);
  };

  if (!isMounted) {
    return (
      <IconButton
        icon={<BiMoon />}
        onClick={toggleMode}
        aria-label="Toggle theme"
        fontSize="xl"
        color={colorMode === "dark" ? "#fbbf24" : "#6366f1"}
        bg={colorMode === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(99, 102, 241, 0.1)"}
        borderRadius="full"
        w="40px"
        h="40px"
        minW="40px"
        _hover={{ 
          bg: colorMode === "dark" ? "rgba(255, 255, 255, 0.15)" : "rgba(99, 102, 241, 0.2)", 
          transform: "scale(1.05)" 
        }}
        _active={{ 
          bg: colorMode === "dark" ? "rgba(255, 255, 255, 0.2)" : "rgba(99, 102, 241, 0.3)", 
          transform: "scale(0.97)" 
        }}
        transition="all 0.2s ease"
      />
    );
  }

  return (
    <IconButton
      icon={isDarkMode ? <BiSun /> : <BiMoon />}
      onClick={toggleMode}
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      fontSize="xl"
      color={isDarkMode ? "#fbbf24" : "#6366f1"}
      bg={isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(99, 102, 241, 0.1)"}
      borderRadius="full"
      w="40px"
      h="40px"
      minW="40px"
      _hover={{ 
        bg: isDarkMode ? "rgba(255, 255, 255, 0.15)" : "rgba(99, 102, 241, 0.2)", 
        transform: "scale(1.05)" 
      }}
      _active={{ 
        bg: isDarkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(99, 102, 241, 0.3)", 
        transform: "scale(0.97)" 
      }}
      transition="all 0.2s ease"
    />
  );
};

export default HeaderThemeSwitch;