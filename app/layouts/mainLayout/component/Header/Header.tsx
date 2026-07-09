'use client'

import { PERMISSION_KEYS, hasAnyCourseViewPermission, hasPermission } from '@/app/config/utils/permissions';
import { isLearnerRole, isManagerRole } from '@/app/config/utils/roleAccess';
import stores from '@/app/store/stores';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import {
  Avatar,
  Box,
  Button,
  Link as ChakraLink,
  Collapse,
  Container,
  Flex,
  HStack,
  Icon,
  IconButton,
  Image,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
  Text,
  useColorMode,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerBody,
  DrawerCloseButton,
} from '@chakra-ui/react';
import { observer } from 'mobx-react-lite';
import NextLink from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { FiBookOpen, FiGrid, FiHome, FiMenu, FiUser } from 'react-icons/fi';
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
  const isManagerUser = isLoggedIn && isManagerRole(role);
  const appHref = role === 'superadmin'
    ? '/dashboard/admins'
    : hasPermission(user, PERMISSION_KEYS.VIEW_USERS)
      ? '/dashboard/users'
      : hasAnyCourseViewPermission(user)
        ? '/dashboard/course'
        : hasPermission(user, PERMISSION_KEYS.VIEW_BATCHES)
          ? '/dashboard/batches'
          : '/course';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks: NavLink[] = useMemo(() => ([
    { href: '/', label: 'Home' },
    { href: '/course', label: 'Courses' },
    ...(isLearner ? [{ href: '/batches', label: 'Batches' }] : []),
    ...(isManagerUser ? [{ href: '/manager', label: 'Learners' }] : []),
    { href: '/about-us', label: 'About Us' },
    { href: '/contact-us', label: 'Contact Us' },
  ]), [isLearner, isManagerUser]);

  const bottomNavLinks = useMemo(() => {
    const links = [
      { href: '/', label: 'Home', icon: FiHome },
      { href: '/course', label: 'Courses', icon: FiBookOpen },
    ];
    
    // 3. Center Profile/Login Button
    const profileLink = isLoggedIn 
      ? { href: appHref, label: isLearner ? 'My' : 'App', icon: FiUser, isCenter: true }
      : { href: '/login', label: 'Login', icon: FiUser, isCenter: true };
      
    links.push(profileLink);
    
    // 4. Fill the 4th spot so we always have exactly 5 tabs (including 'More')
    if (isLearner) {
      links.push({ href: '/batches', label: 'Batches', icon: FiGrid });
    } else if (isManagerUser) {
      links.push({ href: '/manager', label: 'Learners', icon: FiUser });
    } else {
      links.push({ href: '/about-us', label: 'About', icon: FiGrid });
    }
    
    return links;
  }, [appHref, isLearner, isLoggedIn, isManagerUser]);

  const handleLogout = () => {
    stores.auth.logout();
    setMobileMenuOpen(false);
    setIsProfileOpen(false);
    router.push('/login');
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
        py={{ base: 2, md: scrolled ? 2 : 4 }}
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
                    bgGradient={colorMode === 'light' ? 'linear(to-tr, brand.600, brand.400)' : 'linear(to-tr, brand.400, brand.200)'}
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
                      color={isActive ? (colorMode === 'light' ? 'brand.700' : 'brand.300') : (colorMode === 'light' ? 'gray.600' : 'gray.300')}
                      bg={isActive ? (colorMode === 'light' ? 'brand.50' : 'brand.900') : 'transparent'}
                      boxShadow={isActive ? 'sm' : 'none'}
                      transition="all 0.25s ease"
                      _hover={{
                        color: colorMode === 'light' ? 'brand.700' : 'brand.300',
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
                borderColor={colorMode === 'light' ? 'brand.200' : 'brand.600'}
                color={colorMode === 'light' ? 'brand.600' : 'brand.400'}
                bg={colorMode === 'light' ? 'white' : 'gray.800'}
                _hover={{
                  bg: colorMode === 'light' ? 'brand.50' : 'gray.700',
                  borderColor: 'brand.500',
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
                    borderColor={colorMode === 'light' ? 'brand.600' : 'brand.400'}
                    color={colorMode === 'light' ? 'brand.600' : 'brand.400'}
                    px={6}
                    py={2}
                    borderRadius="full"
                    fontWeight="bold"
                    fontSize="sm"
                    _hover={{
                      bg: colorMode === 'light' ? 'brand.600' : 'brand.500',
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
                      _hover={{ bg: colorMode === 'light' ? 'brand.50' : 'gray.800' }}
                    >
                      <HStack spacing={3}>
                        <Avatar
                          size="sm"
                          name={displayName}
                          src={user?.pic?.url || ''}
                          bg="brand.600"
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
                      <MenuItem borderRadius="xl" onClick={() => router.push('/user-profile')}>
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
                  borderColor={colorMode === 'light' ? 'brand.600' : 'brand.400'}
                  color={colorMode === 'light' ? 'brand.600' : 'brand.400'}
                  px={7}
                  py={2}
                  borderRadius="full"
                  fontWeight="bold"
                  fontSize="sm"
                  _hover={{
                    bg: colorMode === 'light' ? 'brand.600' : 'brand.500',
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
                _hover={{ bg: colorMode === 'light' ? 'brand.50' : 'gray.700' }}
              >
                <Box w="22px" h="22px" position="relative">
                  <Box
                    position="absolute"
                    h="2px"
                    w="100%"
                    bg="brand.600"
                    borderRadius="full"
                    transition="0.3s"
                    top={mobileMenuOpen ? '50%' : '25%'}
                    transform={mobileMenuOpen ? 'rotate(45deg)' : 'none'}
                  />
                  <Box
                    position="absolute"
                    h="2px"
                    w="100%"
                    bg="brand.600"
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

        <Drawer
          isOpen={mobileMenuOpen}
          placement="bottom"
          onClose={() => setMobileMenuOpen(false)}
        >
          <DrawerOverlay display={{ base: 'block', md: 'none' }} />
          <DrawerContent
            display={{ base: 'block', md: 'none' }}
            bg={colorMode === 'light' ? 'white' : 'gray.800'}
            borderTopRadius="2xl"
          >
            <Box w="40px" h="4px" bg={colorMode === 'light' ? 'gray.300' : 'gray.600'} borderRadius="full" mx="auto" mt={3} mb={1} />
            <DrawerCloseButton top={2} right={3} />
            <DrawerBody pb="calc(24px + env(safe-area-inset-bottom))" px={4}>
              <Stack gap={{ base: 2, sm: 3 }} mt={3}>
                {isLoggedIn ? (
                  <Box borderWidth="1px" borderColor={colorMode === 'light' ? 'gray.100' : 'gray.700'} borderRadius="xl" p={3}>
                    <HStack spacing={3}>
                      <Avatar size="md" name={displayName} src={user?.pic?.url || ''} bg="brand.600" color="white" />
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
                      color={pathname === link.href ? (colorMode === 'light' ? 'brand.600' : 'brand.300') : (colorMode === 'light' ? 'gray.700' : 'gray.200')}
                      bg={pathname === link.href ? (colorMode === 'light' ? 'brand.50' : 'brand.900') : 'transparent'}
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
                      bg={colorMode === 'light' ? 'brand.600' : 'brand.500'}
                      textAlign="center"
                      minH="48px"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      onClick={() => setMobileMenuOpen(false)}
                      _hover={{
                        textDecoration: 'none',
                        bg: colorMode === 'light' ? 'brand.700' : 'brand.600',
                        transform: 'translateY(-2px)'
                      }}
                      transition="all 0.2s"
                    >
                      Login
                    </ChakraLink>
                  </NextLink>
                )}
              </Stack>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </Box>

      <Box
        display={{ base: 'block', md: 'none' }}
        position="fixed"
        left="0"
        right="0"
        bottom="0"
        zIndex="1000"
        bg={colorMode === 'light' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(5, 5, 5, 0.95)'}
        borderTop="1px solid"
        borderColor={colorMode === 'light' ? 'gray.200' : 'gray.800'}
        backdropFilter="blur(24px)"
        boxShadow={colorMode === 'light' ? '0 -4px 30px rgba(0, 0, 0, 0.04)' : '0 -4px 30px rgba(0, 0, 0, 0.5)'}
        pb="env(safe-area-inset-bottom, 0px)"
      >
        <Flex
          h="68px"
          w="full"
          maxW="520px"
          mx="auto"
          align="center"
          justify="space-around"
          px={2}
          position="relative"
        >
          {bottomNavLinks.map((link: any) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            const isCenter = link.isCenter;
            
            return (
              <ChakraLink
                key={link.href}
                as={NextLink}
                href={link.href}
                position="relative"
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                h={isCenter ? "64px" : "full"}
                w={isCenter ? "64px" : "14"}
                mt={isCenter ? "-36px" : "0"}
                borderRadius={isCenter ? "full" : "none"}
                border={isCenter ? "5px solid" : "none"}
                borderColor={isCenter ? (colorMode === 'light' ? 'white' : 'gray.900') : "transparent"}
                bgGradient={isCenter ? (colorMode === 'light' ? 'linear(to-br, brand.400, brand.600)' : 'linear(to-br, brand.500, brand.700)') : "none"}
                color={
                  isCenter 
                    ? "white" 
                    : (isActive ? (colorMode === 'light' ? 'brand.600' : 'brand.400') : (colorMode === 'light' ? 'gray.400' : 'gray.500'))
                }
                boxShadow={isCenter ? (colorMode === 'light' ? '0 10px 20px -5px var(--chakra-colors-brand-500)' : '0 10px 20px -5px rgba(0,0,0,0.8)') : "none"}
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                _hover={{ textDecoration: 'none', transform: isCenter ? 'translateY(-2px)' : 'none' }}
                _active={{ transform: 'scale(0.92)' }}
                onClick={() => setMobileMenuOpen(false)}
                zIndex={isCenter ? 10 : 1}
              >
                {/* Active Indicator (Line at top) */}
                {isActive && !isCenter && (
                  <Box
                    position="absolute"
                    top="-1px"
                    h="3px"
                    w="28px"
                    borderBottomRadius="md"
                    bg={colorMode === 'light' ? 'brand.500' : 'brand.400'}
                    boxShadow={colorMode === 'light' ? '0 2px 8px var(--chakra-colors-brand-200)' : '0 2px 8px var(--chakra-colors-brand-800)'}
                  />
                )}

                {/* Icon */}
                <Icon
                  as={link.icon}
                  boxSize={isCenter ? "26px" : "22px"}
                  transition="all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                  transform={(!isCenter && isActive) ? 'scale(1.15) translateY(-2px)' : 'scale(1) translateY(0)'}
                  mb={isCenter ? 0 : 1}
                />

                {/* Label */}
                {!isCenter && (
                  <Text
                    fontSize="10px"
                    fontWeight={isActive ? "700" : "500"}
                    transition="all 0.3s"
                    color={isActive ? (colorMode === 'light' ? 'brand.600' : 'brand.400') : (colorMode === 'light' ? 'gray.500' : 'gray.500')}
                    lineHeight="1"
                    noOfLines={1}
                  >
                    {link.label}
                  </Text>
                )}
              </ChakraLink>
            );
          })}
          
          <Button
            variant="unstyled"
            position="relative"
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            h="full"
            w="14"
            color={mobileMenuOpen ? (colorMode === 'light' ? 'brand.600' : 'brand.400') : (colorMode === 'light' ? 'gray.400' : 'gray.500')}
            transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            _active={{ transform: 'scale(0.92)' }}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {/* Active Indicator (Line at top) */}
            {mobileMenuOpen && (
              <Box
                position="absolute"
                top="-1px"
                h="3px"
                w="28px"
                borderBottomRadius="md"
                bg={colorMode === 'light' ? 'brand.500' : 'brand.400'}
                boxShadow={colorMode === 'light' ? '0 2px 8px var(--chakra-colors-brand-200)' : '0 2px 8px var(--chakra-colors-brand-800)'}
              />
            )}

            <Icon
              as={FiMenu}
              boxSize="22px"
              transition="all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
              transform={mobileMenuOpen ? 'scale(1.15) translateY(-2px)' : 'scale(1) translateY(0)'}
              mb={1}
            />

            <Text
              fontSize="10px"
              fontWeight={mobileMenuOpen ? "700" : "500"}
              transition="all 0.3s"
              color={mobileMenuOpen ? (colorMode === 'light' ? 'brand.600' : 'brand.400') : (colorMode === 'light' ? 'gray.500' : 'gray.500')}
              lineHeight="1"
            >
              More
            </Text>
          </Button>
        </Flex>
      </Box>

      <UserProfileDrawer isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </>
  );
});

export default Header;
