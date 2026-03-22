"use client";
import {
  Box,
  Flex,
  Image,
  IconButton,
  Drawer,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Center,
  Text,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import NavItemsLayout from "./component/NavItemsLayout";
import HeroNavButton from "./component/HeroNavButton";
import { HamburgerIcon } from "@chakra-ui/icons";
import { useRouter } from "next/navigation";
import WhatsAppButton from "../../../../component/common/whatsApp/whatsAppButton";
import { observer } from "mobx-react-lite";
import stores from "../../../../store/stores";

const Header = observer(() => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();

  const [content, setContent] = useState<any>({});
  const {
    companyStore: { getPageContent, companyDetails },
  } = stores;

  useEffect(() => {
    setContent(getPageContent("home") || {});
  }, [companyDetails, getPageContent]);

  return (
    <Box shadow="sm" position="sticky" top="0" zIndex="1000" bg="white">
      {/* Top Bar */}
      <Box
        h={{ lg: "2rem", xl: "2.5rem" }}
        color="white"
        textAlign="center"
        bg="#045B64"
        fontSize={{ base: "xs", lg: "lg" }}
        p={1}
      >
        <Text>
          {content?.banner || "Get 30% discount on your first therapy session!"}
        </Text>
      </Box>

      {/* Mobile Header */}
      <Flex
        alignItems="center"
        justify="space-between"
        px={{ base: 2, md: 6 }}
        py={1}
        bg="white"
        display={{ base: "flex", lg: "none" }}
        h="4rem"
      >
        <Image
          src="/images/logo.png"
          alt="best child psychologist in noida"
          h={{ base: "43px", sm: "48px" }}
          cursor="pointer"
          onClick={() => router.push("/")}
          mr="auto"
        />
        <Flex gap={2} align="center">
          <WhatsAppButton /> {/* WhatsApp button in mobile header */}
          <IconButton
            icon={<HamburgerIcon fontSize={"22px"} />}
            onClick={onOpen}
            aria-label="Open menu"
            variant="ghost"
            size={"md"}
          />
        </Flex>
      </Flex>

      {/* Drawer for Mobile Navigation */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerBody>
            <Center mt={6} mb={4}>
              <Image
                src="/images/logo.png"
                alt="Dental"
                h="50px"
                onClick={() => router.push("/")}
              />
            </Center>
            <Box px={4}>
              <NavItemsLayout onClose={onClose} />
            </Box>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Desktop Header */}
      <Flex
        alignItems="center"
        justify="space-between"
        px={{ lg: 5, xl: 8 }}
        py={2.5}
        display={{ base: "none", lg: "flex" }}
      >
        <Image
          src="/images/logo.png"
          alt="Mental Health Doctor In Noida"
          h={{ base: "35px", lg: "50px", xl: "60px" }}
          cursor="pointer"
          onClick={() => router.push("/")}
        />

        <Flex flex={1} justify="center" pr={2}>
          <NavItemsLayout />
        </Flex>

        <Flex align="center" gap={3}>
          <WhatsAppButton />
          <HeroNavButton />
        </Flex>
      </Flex>
    </Box>
  );
});

export default Header;