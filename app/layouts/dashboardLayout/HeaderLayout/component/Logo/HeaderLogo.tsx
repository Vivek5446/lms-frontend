"use client";

import { Box, Flex, IconButton, useBreakpointValue } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { BiLeftArrowAlt, BiRightArrowAlt } from "react-icons/bi";
import stores from "../../../../../store/stores";
import SearchBar from "../HeaderNavbar/SearchBar/SearchBar";

const HeaderLogo = observer(() => {
  const isLargerThanXl = useBreakpointValue({ lg: true }) ?? false;

  const {
    layout: { fullScreenMode, openDashSidebarFun, isCallapse },
  } = stores;

  return (
    <Flex width="100%" alignItems="center" justifyContent="space-between" display="flex" ml={2}>
      {isLargerThanXl && (
        <Flex alignItems="center">
          {/* Sidebar collapse/expand toggle */}
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
            bg="gray.700"
            color="white"
            fontSize="xl"
            w="40px"
            h="40px"
            minW="40px"
            _hover={{ bg: "blue.500", transform: "scale(1.05)" }}
            _active={{ bg: "blue.600", transform: "scale(0.97)" }}
            transition="all 0.2s ease"
            sx={{ marginRight: "1rem", marginTop: "2px" }}
          />

          {/* Fullscreen toggle — kept hidden as per original */}
          <IconButton
            aria-label="open the drawer button"
            icon={
              fullScreenMode ? (
                <BiRightArrowAlt fontSize={20} />
              ) : (
                <BiLeftArrowAlt fontSize={20} />
              )
            }
            onClick={() => openDashSidebarFun()}
            isRound
            bg="gray.700"
            color="white"
            fontSize="xl"
            w="40px"
            h="40px"
            minW="40px"
            _hover={{ bg: "blue.500", transform: "scale(1.05)" }}
            _active={{ bg: "blue.600", transform: "scale(0.97)" }}
            transition="all 0.2s ease"
            sx={{ marginRight: "1rem", marginTop: "2px" }}
            display="none"
          />
        </Flex>
      )}
      <SearchBar />
      <Box />
    </Flex>
  );
});

export default HeaderLogo;