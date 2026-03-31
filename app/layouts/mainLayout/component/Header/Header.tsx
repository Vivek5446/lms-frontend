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
  Container,
  useColorMode,
  IconButton
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';

interface NavLink {
  href: string;
  label: string;
}

const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);
  const pathname = usePathname();
  const { colorMode, toggleColorMode } = useColorMode();

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
      bg={scrolled ? (colorMode === 'light' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(26, 32, 44, 0.8)') : (colorMode === 'light' ? 'white' : 'gray.900')}
      backdropFilter={scrolled ? 'blur(15px)' : 'none'}
      borderBottom="1px solid"
      borderColor={scrolled ? (colorMode === 'light' ? 'gray.100' : 'gray.700') : 'transparent'}
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
                bgGradient={colorMode === 'light' ? "linear(to-tr, blue.600, blue.400)" : "linear(to-tr, blue.400, blue.200)"}
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
            bg={colorMode === 'light' ? 'gray.50' : 'gray.800'}
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
                    color={isActive ? (colorMode === 'light' ? 'blue.700' : 'blue.300') : (colorMode === 'light' ? 'gray.600' : 'gray.300')}
                    bg={isActive ? (colorMode === 'light' ? 'rgba(66, 153, 225, 0.2)' : 'rgba(66, 153, 225, 0.3)') : 'transparent'}
                    boxShadow={isActive ? 'sm' : 'none'}
                    transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                    _hover={{ 
                      color: colorMode === 'light' ? 'blue.700' : 'blue.300',
                      bg: colorMode === 'light' ? 'white' : 'gray.700',
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
          <HStack gap={3}>
            {/* Dark Mode Toggle */}
            <IconButton
              aria-label={colorMode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
              onClick={toggleColorMode}
              variant="outline"
              size="md"
              borderColor={colorMode === 'light' ? 'blue.200' : 'blue.600'}
              color={colorMode === 'light' ? 'blue.600' : 'blue.400'}
              bg={colorMode === 'light' ? 'white' : 'gray.800'}
              _hover={{
                bg: colorMode === 'light' ? 'blue.50' : 'gray.700',
                borderColor: 'blue.500',
                transform: 'scale(1.05)'
              }}
              _active={{ transform: 'scale(0.95)' }}
              transition="all 0.2s"
              display={{ base: 'none', sm: 'flex' }}
              borderRadius="full"
            />

            {/* Login Button */}
            <ChakraLink
              as={NextLink}
              href="/login"
              display={{ base: 'none', sm: 'flex' }}
              bg={colorMode === 'light' ? 'white' : 'gray.800'}
              border="1px solid"
              borderColor={colorMode === 'light' ? 'blue.600' : 'blue.400'}
              color={colorMode === 'light' ? 'blue.600' : 'blue.400'}
              px={7}
              py={2.5}
              borderRadius="full"
              fontWeight="bold"
              fontSize="sm"
              boxShadow={colorMode === 'light' ? '0 10px 20px -10px rgba(49, 130, 206, 0.25)' : '0 10px 20px -10px rgba(0, 0, 0, 0.25)'}
              _hover={{
                bg: colorMode === 'light' ? 'blue.600' : 'blue.500',
                color: 'white',
                boxShadow: colorMode === 'light' ? '0 12px 24px -12px rgba(49, 130, 206, 0.35)' : '0 12px 24px -12px rgba(0, 0, 0, 0.35)',
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
          bg={colorMode === 'light' ? 'white' : 'gray.800'} 
          mx={4}
          mt={2}
          shadow="2xl"
          borderRadius="2xl"
          border="1px solid"
          borderColor={colorMode === 'light' ? 'gray.50' : 'gray.700'}
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
                  color={pathname === link.href ? (colorMode === 'light' ? 'blue.600' : 'blue.300') : (colorMode === 'light' ? 'gray.600' : 'gray.300')}
                  bg={pathname === link.href ? (colorMode === 'light' ? 'blue.50' : 'blue.800') : 'transparent'}
                  _hover={{ bg: colorMode === 'light' ? 'gray.50' : 'gray.700', textDecoration: 'none' }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </ChakraLink>
              </NextLink>
            ))}

            {/* Dark Mode Toggle for Mobile */}
            <Button
              onClick={toggleColorMode}
              variant="ghost"
              leftIcon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
              justifyContent="flex-start"
              p={4}
              borderRadius="xl"
              fontWeight="600"
              color={colorMode === 'light' ? 'gray.600' : 'gray.300'}
              _hover={{ bg: colorMode === 'light' ? 'gray.50' : 'gray.700' }}
            >
              {colorMode === 'light' ? 'Dark Mode' : 'Light Mode'}
            </Button>

            <NextLink href="/login">
              <ChakraLink
                p={4}
                borderRadius="xl"
                fontWeight="bold"
                color="white"
                bg={colorMode === 'light' ? 'blue.600' : 'blue.500'}
                textAlign="center"
                onClick={() => setMobileMenuOpen(false)}
                _hover={{ textDecoration: 'none', bg: colorMode === 'light' ? 'blue.700' : 'blue.600' }}
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