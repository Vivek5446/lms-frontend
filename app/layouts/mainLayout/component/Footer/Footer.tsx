'use client'

import React from "react";
import {
  Box,
  Container,
  SimpleGrid,
  Stack,
  Text,
  Link as ChakraLink,
  Image,
  Divider,
  HStack,
  Icon,
  Flex,
  useColorModeValue,
} from "@chakra-ui/react";
import NextLink from "next/link";
// Assuming you use react-icons for social consistency
import { FaLinkedin, FaTwitter, FaInstagram, FaYoutube } from "react-icons/fa";

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    platform: [
      { name: "Home", href: "/" },
      { name: "All Courses", href: "/course" },
      { name: "Learning Paths", href: "/paths" },
      { name: "Certifications", href: "/certifications" },
    ],
    company: [
      { name: "About Us", href: "/about-us" },
      { name: "Contact Us", href: "/contact-us" },
      { name: "Careers", href: "/careers" },
      { name: "Instructor Portal", href: "/instructor" },
    ],
    legal: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Cookie Policy", href: "/cookies" },
    ],
  };

  const footerBg = useColorModeValue('white','gray.900');
  const footerBorder = useColorModeValue('gray.100','gray.700');
  const textColor = useColorModeValue('gray.600','gray.300');
  const headingColor = useColorModeValue('gray.800','whiteAlpha.900');

  return (
    <Box as="footer" bg={footerBg} borderTop="1px solid" borderColor={footerBorder} pt={16} pb={8}>
      <Container maxW="1400px">
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={12} mb={12}>
          {/* Brand Section */}
          <Stack spacing={6}>
            <NextLink href="/" passHref legacyBehavior>
              <ChakraLink _hover={{ textDecoration: 'none' }} display="flex" alignItems="center" gap={3}>
                <Image
                  src="https://www.lmscert.com/Logo%20LMS%20-1-.svg"
                  alt="CRAFT LMS Logo"
                  h="40px"
                  objectFit="contain"
                />
                <Text
                  fontWeight="900"
                  fontSize="xl"
                  letterSpacing="-1px"
                  bgGradient="linear(to-tr, blue.600, blue.400)"
                  bgClip="text"
                >
                  CRAFT
                </Text>
              </ChakraLink>
            </NextLink>
            <Text color="gray.600" fontSize="sm" lineHeight="tall">
              Empowering learners worldwide with industry-standard certifications and expert-led courses. Elevate your craft today.
            </Text>
            <HStack spacing={4}>
              {[FaTwitter, FaLinkedin, FaInstagram, FaYoutube].map((socialIcon, index) => (
                <ChakraLink
                  key={index}
                  href="#"
                  color="gray.400"
                  _hover={{ color: "blue.500", transform: "translateY(-2px)" }}
                  transition="all 0.3s"
                >
                  <Icon as={socialIcon} boxSize={5} />
                </ChakraLink>
              ))}
            </HStack>
          </Stack>

          {/* Platform Links */}
          <Stack spacing={4}>
            <Text fontWeight="bold" fontSize="md" color={headingColor}>Platform</Text>
            {footerLinks.platform.map((link) => (
              <NextLink key={link.name} href={link.href} passHref legacyBehavior>
                <ChakraLink fontSize="sm" color={textColor} _hover={{ color: "blue.500", textDecoration: "none" }}>
                </ChakraLink>
              </NextLink>
            ))}
          </Stack>

          {/* Company Links */}
          <Stack spacing={4}>
            <Text fontWeight="bold" fontSize="md" color={headingColor}>Company</Text>
            {footerLinks.company.map((link) => (
              <NextLink key={link.name} href={link.href} passHref legacyBehavior>
                <ChakraLink fontSize="sm" color={textColor} _hover={{ color: "blue.500", textDecoration: "none" }}>
                  {link.name}
                </ChakraLink>
              </NextLink>
            ))}
          </Stack>

          {/* Newsletter/Contact Small */}
          <Stack spacing={4}>
            <Text fontWeight="bold" fontSize="md" color={headingColor}>Support</Text>
            <Text fontSize="sm" color={textColor}>
              Have questions? Reach out to our learning advisors.
            </Text>
            <NextLink href="/contact-us" passHref legacyBehavior>
              <ChakraLink
                display="inline-flex"
                alignItems="center"
                justifyContent="center"
                bg="blue.50"
                color="blue.600"
                fontWeight="bold"
                px={4}
                py={2}
                rounded="lg"
                fontSize="sm"
                _hover={{ bg: "blue.600", color: "white", textDecoration: "none" }}
                transition="all 0.2s"
              >
                Contact Support
              </ChakraLink>
            </NextLink>
          </Stack>
        </SimpleGrid>

        <Divider borderColor="gray.100" />

        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align="center"
          pt={8}
          gap={4}
        >
          <Text fontSize="xs" color={textColor}>
            © {currentYear} <Box as="span" fontWeight="bold">CRAFT LMS</Box>. All rights reserved.
          </Text>
          
          <HStack spacing={6}>
            {footerLinks.legal.map((link) => (
              <NextLink key={link.name} href={link.href} passHref legacyBehavior>
                <ChakraLink fontSize="xs" color="gray.500" _hover={{ color: "blue.600" }}>
                  {link.name}
                </ChakraLink>
              </NextLink>
            ))}
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
};

export default Footer;