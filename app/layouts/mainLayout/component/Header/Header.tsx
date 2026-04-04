'use client'

import { useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Avatar,
  Box,
  Button,
  Container,
  Flex,
  HStack,
  IconButton,
  Image,
  Link as ChakraLink,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
  Text,
  useColorMode,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import stores from '@/app/store/stores';
import { isLearnerRole } from '@/app/config/utils/roleAccess';
import UserProfileDrawer from './UserProfileDrawer';

interface NavLink {
  href: string;
  label: string;
}

const Header: React.FC = observer(() => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { colorMode, toggleColorMode } = useColorMode();
  const user = stores.auth.user;
  const role = String(stores.auth.userType || user?.role || '').toLowerCase();
  const isLoggedIn = Boolean(user);
  const isLearner = isLoggedIn && isLearnerRole(role);
  const appHref = role === 'superadmin' ? '/dashboard/admins' : role === 'admin' || role === 'departmenthead' ? '/dashboard/users' : '/course';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks: NavLink[] = useMemo(() => ([
    { href: '/', label: 'Home' },
    { href: '/course', label: 'Courses' },
    ...(isLearner ? [{ href: '/batches', label: 'Batches' }] : []),
    { href: '/about-us', label: 'About Us' },
    { href: '/contact-us', label: 'Contact Us' },
  ]), [isLearner]);

  const handleLogout = () => {
    stores.auth.logout();
    setMobileMenuOpen(false);
    setIsProfileOpen(false);
    router.push('/');
  };

  const displayName = user?.name || user?.username || 'Account';

  return (
    <>
      <Box
        as="header"
        position="sticky"
        top="0"
        zIndex="1000"
        bg={scrolled ? (colorMode === 'light' ? 'rgba(255, 255, 255, 0.78)' : 'rgba(17, 24, 39, 0.85)') : (colorMode === 'light' ? 'white' : 'gray.900')}
        backdropFilter={scrolled ? 'blur(16px)' : 'none'}
        borderBottom="1px solid"
        borderColor={scrolled ? (colorMode === 'light' ? 'gray.100' : 'gray.700') : 'transparent'}
        transition="all 0.35s ease"
        py={scrolled ? 2 : 4}
      >
        <Container maxW="1400px" px={{ base: 3, md: 6 }}>
          <Flex align="center" justify="space-between" gap={4}>
            <NextLink href="/">
              <ChakraLink _hover={{ textDecoration: 'none' }} display="flex" alignItems="center" gap={{ base: 1, md: 3 }}>
                <Box transition="transform 0.4s ease" _hover={{ transform: 'scale(1.06) rotate(-2deg)' }}>
                  <Image
                    src="https://www.lmscert.com/Logo%20LMS%20-1-.svg"
                    alt="CRAFT LMS Logo"
                    h={{ base: '32px', md: '48px' }}
                    objectFit="contain"
                  />
                </Box>
                <Text
                  fontWeight="900"
                  fontSize={{ base: 'md', lg: '2xl' }}
                  letterSpacing="-1px"
                  bgGradient={colorMode === 'light' ? 'linear(to-tr, blue.600, blue.400)' : 'linear(to-tr, blue.400, blue.200)'}
                  bgClip="text"
                  display={{ base: 'none', lg: 'block' }}
                >
                  CRAFT
                </Text>
              </ChakraLink>
            </NextLink>

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
                      transition="all 0.25s ease"
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

            <HStack gap={3}>
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

              {isLoggedIn ? (
                <>
                  <ChakraLink
                    as={NextLink}
                    href={appHref}
                    display={{ base: 'none', md: 'flex' }}
                    bg={colorMode === 'light' ? 'white' : 'gray.800'}
                    border="1px solid"
                    borderColor={colorMode === 'light' ? 'blue.600' : 'blue.400'}
                    color={colorMode === 'light' ? 'blue.600' : 'blue.400'}
                    px={6}
                    py={2.5}
                    borderRadius="full"
                    fontWeight="bold"
                    fontSize="sm"
                    _hover={{
                      bg: colorMode === 'light' ? 'blue.600' : 'blue.500',
                      color: 'white',
                      transform: 'translateY(-1px)',
                      textDecoration: 'none',
                    }}
                    transition="all 0.2s"
                  >
                    {isLearner ? 'My Learning' : 'Dashboard'}
                  </ChakraLink>

                  <Menu>
                    <MenuButton
                      as={Button}
                      variant="ghost"
                      p={1}
                      h="auto"
                      borderRadius="full"
                      display={{ base: 'none', md: 'inline-flex' }}
                      _hover={{ bg: colorMode === 'light' ? 'blue.50' : 'gray.800' }}
                    >
                      <HStack spacing={3}>
                        <Avatar
                          size="sm"
                          name={displayName}
                          src={user?.pic?.url || ''}
                          bg="blue.600"
                          color="white"
                        />
                        <Box textAlign="left" display={{ base: 'none', lg: 'block' }}>
                          <Text fontSize="sm" fontWeight="bold" noOfLines={1}>
                            {displayName}
                          </Text>
                          <Text fontSize="xs" color="gray.500" textTransform="capitalize" noOfLines={1}>
                            {String(user?.role || '').replace(/_/g, ' ')}
                          </Text>
                        </Box>
                      </HStack>
                    </MenuButton>
                    <MenuList borderRadius="2xl" p={2}>
                      <Box px={3} py={2}>
                        <Text fontWeight="bold" noOfLines={1}>{displayName}</Text>
                        <Text fontSize="sm" color="gray.500" noOfLines={1}>{user?.username || ''}</Text>
                      </Box>
                      <MenuItem borderRadius="xl" onClick={() => setIsProfileOpen(true)}>
                        View profile
                      </MenuItem>
                      <MenuItem borderRadius="xl" as={NextLink} href={appHref}>
                        {isLearner ? 'Go to learning' : 'Open dashboard'}
                      </MenuItem>
                      <MenuItem borderRadius="xl" color="red.500" onClick={handleLogout}>
                        Logout
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </>
              ) : (
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
                  _hover={{
                    bg: colorMode === 'light' ? 'blue.600' : 'blue.500',
                    color: 'white',
                    transform: 'translateY(-1px)',
                    textDecoration: 'none',
                  }}
                  transition="all 0.2s"
                >
                  Login
                </ChakraLink>
              )}

              <Button
                display={{ base: 'flex', md: 'none' }}
                variant="ghost"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle Menu"
                rounded="lg"
                minH="44px"
                minW="44px"
                p={0}
                _hover={{ bg: colorMode === 'light' ? 'blue.50' : 'gray.700' }}
              >
                <Box w="22px" h="22px" position="relative">
                  <Box
                    position="absolute"
                    h="2px"
                    w="100%"
                    bg="blue.600"
                    borderRadius="full"
                    transition="0.3s"
                    top={mobileMenuOpen ? '50%' : '25%'}
                    transform={mobileMenuOpen ? 'rotate(45deg)' : 'none'}
                  />
                  <Box
                    position="absolute"
                    h="2px"
                    w="100%"
                    bg="blue.600"
                    borderRadius="full"
                    transition="0.3s"
                    bottom={mobileMenuOpen ? '50%' : '25%'}
                    transform={mobileMenuOpen ? 'rotate(-45deg)' : 'none'}
                  />
                </Box>
              </Button>
            </HStack>
          </Flex>
        </Container>

        {mobileMenuOpen && (
          <Box
            bg={colorMode === 'light' ? 'white' : 'gray.800'}
            mx={{ base: 2, sm: 4 }}
            mt={3}
            shadow="lg"
            borderRadius="xl"
            border="1px solid"
            borderColor={colorMode === 'light' ? 'gray.100' : 'gray.700'}
            display={{ base: 'block', md: 'none' }}
            overflow="hidden"
          >
            <Stack p={{ base: 3, sm: 4 }} gap={{ base: 2, sm: 3 }}>
              {isLoggedIn ? (
                <Box borderWidth="1px" borderColor={colorMode === 'light' ? 'gray.100' : 'gray.700'} borderRadius="xl" p={3}>
                  <HStack spacing={3}>
                    <Avatar size="md" name={displayName} src={user?.pic?.url || ''} bg="blue.600" color="white" />
                    <Box>
                      <Text fontWeight="bold">{displayName}</Text>
                      <Text fontSize="sm" color="gray.500">{user?.username || ''}</Text>
                    </Box>
                  </HStack>
                </Box>
              ) : null}

              {navLinks.map((link) => (
                <NextLink key={link.href} href={link.href}>
                  <ChakraLink
                    p={{ base: '12px 14px', sm: '14px 16px' }}
                    borderRadius="lg"
                    fontWeight="600"
                    fontSize={{ base: 'sm', sm: 'md' }}
                    color={pathname === link.href ? (colorMode === 'light' ? 'blue.600' : 'blue.300') : (colorMode === 'light' ? 'gray.700' : 'gray.200')}
                    bg={pathname === link.href ? (colorMode === 'light' ? 'blue.50' : 'blue.900') : 'transparent'}
                    _hover={{
                      bg: colorMode === 'light' ? 'gray.100' : 'gray.700',
                      textDecoration: 'none',
                      transform: 'translateX(4px)'
                    }}
                    transition="all 0.2s"
                    minH="44px"
                    display="flex"
                    alignItems="center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </ChakraLink>
                </NextLink>
              ))}

              <Box h="1px" bg={colorMode === 'light' ? 'gray.100' : 'gray.700'} my={2} />

              <Button
                onClick={toggleColorMode}
                variant="ghost"
                leftIcon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
                justifyContent="flex-start"
                p={{ base: '12px 14px', sm: '14px 16px' }}
                borderRadius="lg"
                fontSize={{ base: 'sm', sm: 'md' }}
                fontWeight="600"
                color={colorMode === 'light' ? 'gray.700' : 'gray.200'}
                minH="44px"
                _hover={{ bg: colorMode === 'light' ? 'gray.100' : 'gray.700' }}
                w="100%"
              >
                {colorMode === 'light' ? 'Dark Mode' : 'Light Mode'}
              </Button>

              {isLoggedIn ? (
                <>
                  <Button
                    variant="outline"
                    borderRadius="lg"
                    minH="48px"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setIsProfileOpen(true);
                    }}
                  >
                    View profile
                  </Button>
                  <Button
                    as={NextLink}
                    href={appHref}
                    colorScheme="blue"
                    borderRadius="lg"
                    minH="48px"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {isLearner ? 'My Learning' : 'Dashboard'}
                  </Button>
                  <Button
                    variant="ghost"
                    colorScheme="red"
                    borderRadius="lg"
                    minH="48px"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <NextLink href="/login">
                  <ChakraLink
                    p={{ base: '14px', sm: '16px' }}
                    borderRadius="lg"
                    fontWeight="bold"
                    fontSize={{ base: 'sm', sm: 'md' }}
                    color="white"
                    bg={colorMode === 'light' ? 'blue.600' : 'blue.500'}
                    textAlign="center"
                    minH="48px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    onClick={() => setMobileMenuOpen(false)}
                    _hover={{
                      textDecoration: 'none',
                      bg: colorMode === 'light' ? 'blue.700' : 'blue.600',
                      transform: 'translateY(-2px)'
                    }}
                    transition="all 0.2s"
                  >
                    Login
                  </ChakraLink>
                </NextLink>
              )}
            </Stack>
          </Box>
        )}
      </Box>

      <UserProfileDrawer isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </>
  );
});

export default Header;
