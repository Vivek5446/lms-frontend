"use client";

import { Flex, IconButton, useBreakpointValue, useColorModeValue, Text } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { BiLeftArrowAlt, BiRightArrowAlt } from "react-icons/bi";
import { FaBars } from "react-icons/fa";
import stores from "../../../../../store/stores";
import SearchBar from "../HeaderNavbar/SearchBar/SearchBar";

const HeaderLogo = observer(() => {
  const isLargerThanXl = useBreakpointValue({ xl: true }) ?? false;

  const {
    layout: { fullScreenMode, openDashSidebarFun, isCallapse, setOpenMobileSideDrawer },
  } = stores;

  return (
    <Flex width="100%" minW={0} alignItems="center" gap={{ base: 2, md: 3 }}>
      {/* Desktop view sidebar toggle */}
      {isLargerThanXl && (
        <Flex alignItems="center" flexShrink={0}>
          <IconButton
            aria-label="Toggle sidebar"
            icon={
              isCallapse ? (
                <BiRightArrowAlt fontSize={20} />
              ) : (
                <BiLeftArrowAlt fontSize={20} />
              )
            }
            onClick={() => openDashSidebarFun()}
            isRound
            bg={useColorModeValue("blackAlpha.50", "whiteAlpha.100")}
            color={useColorModeValue("gray.700", "white")}
            fontSize="lg"
            w={{ xl: "38px", "2xl": "40px" }}
            h={{ xl: "38px", "2xl": "40px" }}
            minW={{ xl: "38px", "2xl": "40px" }}
            _hover={{ 
              bg: useColorModeValue("blackAlpha.100", "whiteAlpha.200"), 
              transform: "scale(1.05)",
              color: useColorModeValue("brand.600", "brand.300")
            }}
            _active={{ 
              bg: useColorModeValue("blackAlpha.200", "whiteAlpha.300"), 
              transform: "scale(0.97)" 
            }}
            transition="all 0.2s ease"
            sx={{ marginRight: "0.75rem", marginTop: "2px" }}
          />
        </Flex>
      )}

      {/* Mobile view native app layout (Left Hamburger + Title) */}
      {!isLargerThanXl && (
        <Flex alignItems="center" gap={3}>
          <IconButton
            aria-label="Open navigation"
            icon={<FaBars />}
            onClick={() => setOpenMobileSideDrawer(true)}
            isRound
            bg={useColorModeValue("blackAlpha.50", "whiteAlpha.100")}
            color={useColorModeValue("gray.700", "white")}
            fontSize="lg"
            w="40px"
            h="40px"
            minW="40px"
            p={0}
            _hover={{ 
              bg: useColorModeValue("blackAlpha.100", "whiteAlpha.200"), 
              transform: "scale(1.05)",
              color: useColorModeValue("brand.600", "brand.300")
            }}
            _active={{ 
              bg: useColorModeValue("blackAlpha.200", "whiteAlpha.300"), 
              transform: "scale(0.97)" 
            }}
            transition="all 0.2s ease"
          />
          <Text 
            fontSize="xl" 
            fontWeight="900" 
            letterSpacing="tight"
            bgGradient={useColorModeValue("linear(to-r, brand.600, purple.600)", "linear(to-r, brand.300, purple.300)")}
            bgClip="text"
          >
            Dashboard
          </Text>
        </Flex>
      )}

      {/* Only show full SearchBar on desktop */}
      {isLargerThanXl && <SearchBar />}
    </Flex>
  );
});

export default HeaderLogo;
