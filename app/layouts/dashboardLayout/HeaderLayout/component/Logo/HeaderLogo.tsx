"use client";

import { Box, Flex, IconButton, useBreakpointValue, useColorModeValue } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { BiLeftArrowAlt, BiRightArrowAlt } from "react-icons/bi";
import stores from "../../../../../store/stores";
import SearchBar from "../HeaderNavbar/SearchBar/SearchBar";

const HeaderLogo = observer(() => {
  const isLargerThanXl = useBreakpointValue({ lg: true }) ?? false;
  const hoverColor = useColorModeValue("brand.500", "brand.200");
  const hoverBg = useColorModeValue("brand.50", "gray.700");
  const activeBg = useColorModeValue("brand.100", "gray.800");
  const iconColor = useColorModeValue("gray.600", "gray.300");

  const {
    layout: { fullScreenMode, openDashSidebarFun, isCallapse },
  } = stores;

  return (
    <Flex width="100%" alignItems="center" justifyContent="space-between" display="flex" ml={2}>
      {isLargerThanXl && (
        <Flex alignItems="center">
          <IconButton
            variant="ghost"
            aria-label="Arrow"
            fontSize="2xl"
            color={iconColor}
            _hover={{ color: hoverColor, bg: hoverBg }}
            _active={{ bg: activeBg }}
            icon={
              isCallapse ? (
                <BiRightArrowAlt fontSize={25} />
              ) : (
                <BiLeftArrowAlt fontSize={25} />
              )
            }
            size="lg"
            sx={{ marginRight: "1rem", marginTop: "2px" }}
            onClick={() => {
              openDashSidebarFun();
            }}
          />
          <IconButton
            icon={
              fullScreenMode ? (
                <BiRightArrowAlt fontSize={25} />
              ) : (
                <BiLeftArrowAlt fontSize={25} />
              )
            }
            onClick={() => openDashSidebarFun()}
            variant="ghost"
            size="lg"
            sx={{ marginRight: "1rem", marginTop: "2px" }}
            aria-label="open the drawer button"
            display="none"
          />
        </Flex>
      )}
      <SearchBar />
      <Box></Box>
    </Flex>
  );
});

export default HeaderLogo;