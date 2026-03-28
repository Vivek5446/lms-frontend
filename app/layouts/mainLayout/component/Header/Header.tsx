'use client'

import { useState, useEffect } from 'react';
import { 
  Flex, 
  Link as ChakraLink, 
  Image, 
  Box, 
  Button,
  Stack,
  HStack,
  Text,
  Container
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';

interface NavLink {
  href: string;
  label: string;
}

const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks: NavLink[] = [
    { href: '/', label: 'Home' },
    { href: '/course', label: 'Courses' },
    { href: '/about-us', label: 'About Us' },
    { href: '/contact-us', label: 'Contact Us' },
  ];

  return (
    <Box 
      as="header" 
      position="sticky" 
      top="0" 
      zIndex="1000" 
      bg={scrolled ? 'rgba(255, 255, 255, 0.7)' : 'white'}
      backdropFilter={scrolled ? 'blur(15px)' : 'none'}
      borderBottom="1px solid"
      borderColor={scrolled ? 'gray.100' : 'transparent'}
      transition="all 0.4s ease-in-out"
      py={scrolled ? 2 : 4}
    >
      <Container maxW="1400px">
        <Flex align="center" justify="space-between">
          
          {/* Logo with Smooth Interaction */}
          <NextLink href="/">
            <ChakraLink _hover={{ textDecoration: 'none' }} display="flex" alignItems="center" gap={3}>
              <Box
                transition="transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)"
                _hover={{ transform: 'scale(1.1) rotate(-3deg)' }}
              >
                <Image
                  src="https://www.lmscert.com/Logo%20LMS%20-1-.svg"
                  alt="CRAFT LMS Logo"
                  h={{ base: '38px', md: '48px' }}
                  objectFit="contain"
                />
              </Box>
              <Text 
                fontWeight="900" 
                fontSize="2xl" 
                letterSpacing="-1px"
                bgGradient="linear(to-tr, blue.600, blue.400)" 
                bgClip="text"
                display={{ base: 'none', lg: 'block' }}
              >
                CRAFT
              </Text>
            </ChakraLink>
          </NextLink>

          {/* Desktop Navigation - "The Floating Pill" style */}
          <HStack 
            gap={1} 
            display={{ base: 'none', md: 'flex' }}
            bg="gray.50"
            p={1}
            borderRadius="full"
          >
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <NextLink key={link.href} href={link.href} passHref legacyBehavior>
                  <ChakraLink 
                    px={5}
                    py={2}
                    fontSize="sm"
                    fontWeight="600"
                    borderRadius="full"
                    color={isActive ? 'blue.700' : 'gray.600'}
                    bg={isActive ? 'rgba(66, 153, 225, 0.2)' : 'transparent'}
                    boxShadow={isActive ? 'sm' : 'none'}
                    transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                    _hover={{ 
                      color: 'blue.700', 
                      bg: 'white',
                      textDecoration: 'none',
                      transform: 'translateY(-1px)'
                    }}
                  >
                    {link.label}
                  </ChakraLink>
                </NextLink>
              );
            })}
          </HStack>

          {/* Premium Login Button */}
          <HStack gap={4}>
      {/* Login Button */}
      <ChakraLink
        as={NextLink}
        href="/login"
        display={{ base: 'none', sm: 'flex' }}
        bg="white"
        border="1px solid"
        borderColor="blue.600"
        color="blue.600"
        px={7}
        py={2.5}
        borderRadius="full"
        fontWeight="bold"
        fontSize="sm"
        boxShadow="0 10px 20px -10px rgba(49, 130, 206, 0.25)"
        _hover={{
          bg: 'blue.600',
          color: 'white',
          boxShadow: '0 12px 24px -12px rgba(49, 130, 206, 0.35)',
          transform: 'translateY(-1px)',
          textDecoration: 'none',
        }}
        _active={{ transform: 'translateY(0)' }}
        transition="all 0.2s"
      >
        Login
      </ChakraLink>

      {/* Mobile Menu Toggle */}
      <Button
        display={{ base: 'flex', md: 'none' }}
        variant="ghost"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle Menu"
        rounded="xl"
        _hover={{ bg: 'blue.50' }}
        p={2}
        minW="auto"
      >
        <Box w="20px" h="20px" position="relative">
          <Box
            position="absolute"
            h="2px"
            w="100%"
            bg="blue.600"
            borderRadius="full"
            transition="0.3s"
            top={mobileMenuOpen ? '50%' : '30%'}
            transform={mobileMenuOpen ? 'rotate(45deg)' : 'none'}
          />
          <Box
            position="absolute"
            h="2px"
            w="100%"
            bg="blue.600"
            borderRadius="full"
            transition="0.3s"
            bottom={mobileMenuOpen ? '50%' : '30%'}
            transform={mobileMenuOpen ? 'rotate(-45deg)' : 'none'}
          />
        </Box>
      </Button>
    </HStack>
        </Flex>
      </Container>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <Box 
          bg="white" 
          mx={4}
          mt={2}
          shadow="2xl"
          borderRadius="2xl"
          border="1px solid"
          borderColor="gray.50"
          display={{ base: 'block', md: 'none' }}
          overflow="hidden"
        >
          <Stack p={4} gap={2}>
            {navLinks.map((link) => (
              <NextLink key={link.href} href={link.href}>
                <ChakraLink
                  p={4}
                  borderRadius="xl"
                  fontWeight="600"
                  color={pathname === link.href ? 'blue.600' : 'gray.600'}
                  bg={pathname === link.href ? 'blue.50' : 'transparent'}
                  _hover={{ bg: 'gray.50', textDecoration: 'none' }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </ChakraLink>
              </NextLink>
            ))}

            <NextLink href="/login">
              <ChakraLink
                p={4}
                borderRadius="xl"
                fontWeight="bold"
                color="white"
                bg="blue.600"
                textAlign="center"
                onClick={() => setMobileMenuOpen(false)}
                _hover={{ textDecoration: 'none', bg: 'blue.700' }}
              >
                Login
              </ChakraLink>
            </NextLink>
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default Header;