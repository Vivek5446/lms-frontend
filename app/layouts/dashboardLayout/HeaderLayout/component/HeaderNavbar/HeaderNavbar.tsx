"use client"; // Add this for client-side component in Next.js

import { Flex, IconButton, useMediaQuery, useColorModeValue } from "@chakra-ui/react";
import { FaBars } from "react-icons/fa";
import { observer } from "mobx-react-lite";
import HeaderProfile from "./HeaderProfile/HeaderProfile";
import HeaderNotification from "./HeaderNotification/HeaderNotification";
import HeaderThemeSwitch from "./HeaderThemeSwitch/HeaderThemeSwitch";
// import HeaderChatMessage from "./HeaderChatMessage/HeaderChatMessage";
// import CartContainer from "./CartContainer/CartContainer";
import stores from "../../../../../store/stores";

const HeaderNavbar = observer(() => {
  const {
    layout: { setOpenMobileSideDrawer },
  } = stores;
  const [isLargerThan1020] = useMediaQuery("(min-width: 1020px)");

  return (
    <Flex
      display="flex"
      justifyContent="space-around"
      alignItems="center"
      width={isLargerThan1020 ? "12%" : "10%"}
    >
      {isLargerThan1020 ? (
        <>
          {/* <HeaderLanguageSwitch /> */}
          <HeaderThemeSwitch />
          {/* <HeaderChatMessage />
          <HeaderNotification />
          <CartContainer /> */}
          <HeaderNotification />
          <HeaderProfile />
        </>
      ) : (
        <IconButton
          aria-label="Arrow"
          fontSize="xl"
          _hover={{ color: useColorModeValue("brand.500", "brand.200"), bg: useColorModeValue("brand.50", "gray.700") }}
          _active={{ bg: useColorModeValue("brand.100", "gray.800") }}
          icon={
            <FaBars
              cursor="pointer"
              onClick={() => setOpenMobileSideDrawer(true)}
            />
          }
        />
      )}
    </Flex>
  );
});

export default HeaderNavbar;