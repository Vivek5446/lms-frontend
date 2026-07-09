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
import { FiBookOpen, FiGrid, FiHome, FiMenu, FiUser, FiBell } from 'react-icons/fi';
import UserProfileDrawer from './UserProfileDrawer';
import { MobileFooterNav } from './component/MobileFooterNav';
import { MobileMenuDrawer } from './component/MobileMoreMenu';

interface NavLink {
  href: string;
  label: string;
}

const Header: React.FC = observer(() => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
    setIsSidebarOpen(false);
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
        position={{ base: 'relative', md: 'fixed' }}
        w="100%"
        top="0"
        zIndex="1000"
        bg={colorMode === 'light' ? 'rgba(255, 255, 255, 0.75)' : 'rgba(10, 15, 30, 0.75)'}
        backdropFilter="blur(24px) saturate(200%)"
        borderBottom="1px solid"
        borderColor={colorMode === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)'}
        boxShadow={scrolled ? (colorMode === 'light' ? '0 4px 20px -4px rgba(0, 0, 0, 0.06)' : '0 4px 20px -4px rgba(0, 0, 0, 0.5)') : 'none'}
        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        py={2}
      >
        {/* Premium subtle top gradient line */}
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          h="1px"
          bgGradient={colorMode === 'light' ? 'linear(to-r, transparent, brand.400, brand.600, transparent)' : 'linear(to-r, transparent, brand.300, brand.500, transparent)'}
          opacity={0.6}
        />
        <Container maxW="1400px" px={{ base: 3, md: 6 }}>
          <Flex align="center" justify="space-between" gap={4} position="relative" w="100%">
            {/* Left Section (Logo) */}
            <Box flex={{ base: "none", md: 1 }} display="flex" alignItems="center">
              <NextLink href="/">
              <ChakraLink _hover={{ textDecoration: 'none' }} display="flex" alignItems="center" gap={{ base: 1, md: 3 }}>
                <Box transition="transform 0.4s ease" _hover={{ transform: 'scale(1.06) rotate(-2deg)' }}>
                  <Image
                    src="https://www.lmscert.com/Logo%20LMS%20-1-.svg"
                    alt="CRAFT LMS Logo"
                    h={{ base: '28px', md: '36px' }}
                    objectFit="contain"
                  />
                </Box>
                <Text
                  fontWeight="800"
                  fontSize={{ base: 'md', lg: 'xl' }}
                  letterSpacing="-1px"
                    bgGradient={colorMode === 'light' ? 'linear(to-tr, brand.600, brand.400)' : 'linear(to-tr, brand.400, brand.200)'}
                  bgClip="text"
                  display={{ base: 'none', lg: 'block' }}
                >
                  CRAFT
                </Text>
              </ChakraLink>
              </NextLink>
            </Box>

            {/* Center Section (Navigation) */}
            <Flex flex={{ base: "none", md: "auto" }} justify="center">
              <HStack
                gap={1}
              display={{ base: 'none', md: 'flex' }}
              bg={colorMode === 'light' ? 'gray.50' : 'rgba(30, 41, 59, 0.5)'}
              p={1}
              borderRadius="full"
              border="1px solid"
              borderColor={colorMode === 'light' ? 'gray.200' : 'gray.700'}
            >
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <NextLink key={link.href} href={link.href} passHref legacyBehavior>
                    <ChakraLink
                      px={4}
                      py={1.5}
                      fontSize="sm"
                      fontWeight="600"
                      borderRadius="full"
                      color={isActive ? (colorMode === 'light' ? 'brand.700' : 'white') : (colorMode === 'light' ? 'gray.600' : 'gray.400')}
                      bg={isActive ? (colorMode === 'light' ? 'white' : 'rgba(255, 255, 255, 0.1)') : 'transparent'}
                      boxShadow={isActive ? (colorMode === 'light' ? '0 2px 10px rgba(0,0,0,0.05)' : 'inset 0 1px 0 rgba(255,255,255,0.1), 0 2px 10px rgba(0,0,0,0.2)') : 'none'}
                      border={isActive && colorMode === 'dark' ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid transparent'}
                      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                      position="relative"
                      _hover={{
                        color: isActive ? (colorMode === 'light' ? 'brand.700' : 'white') : (colorMode === 'light' ? 'brand.600' : 'white'),
                        bg: isActive ? (colorMode === 'light' ? 'white' : 'rgba(255, 255, 255, 0.15)') : (colorMode === 'light' ? 'gray.100' : 'rgba(255, 255, 255, 0.05)'),
                        textDecoration: 'none',
                      }}
                    >
                      {link.label}
                    </ChakraLink>
                  </NextLink>
                );
              })}
              </HStack>
            </Flex>

            {/* Right Section (Icons & Profile) */}
            <Flex flex={{ base: 1, md: 1 }} justify="flex-end">
              <HStack gap={3}>
              <IconButton
                aria-label={colorMode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
                onClick={toggleColorMode}
                variant="ghost"
                size="md"
                color={colorMode === 'light' ? 'gray.700' : 'gray.200'}
                bg={{ base: 'transparent', md: colorMode === 'light' ? 'gray.50' : 'rgba(255, 255, 255, 0.05)' }}
                border={{ base: 'none', md: '1px solid' }}
                borderColor={{ base: 'transparent', md: colorMode === 'light' ? 'gray.200' : 'rgba(255, 255, 255, 0.08)' }}
                _hover={{
                  bg: colorMode === 'light' ? 'gray.100' : 'rgba(255, 255, 255, 0.12)',
                  color: colorMode === 'light' ? 'brand.600' : 'white',
                  transform: 'translateY(-1px)',
                }}
                _active={{ transform: 'scale(0.95)' }}
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                display={{ base: 'none', sm: 'flex' }}
                borderRadius="full"
              />

              {/* Notification Icon */}
              <IconButton
                aria-label="Notifications"
                icon={
                  <Box position="relative" display="flex" alignItems="center" justifyContent="center">
                    <Icon as={FiBell} boxSize="20px" />
                    <Box
                      position="absolute"
                      top="0px"
                      right="2px"
                      w="7px"
                      h="7px"
                      bg="red.500"
                      borderRadius="full"
                      boxShadow="0 0 0 1px rgba(0,0,0,0.1)"
                    />
                  </Box>
                }
                variant="ghost"
                size="md"
                color={colorMode === 'light' ? 'gray.700' : 'gray.200'}
                bg={{ base: 'transparent', md: colorMode === 'light' ? 'gray.50' : 'rgba(255, 255, 255, 0.05)' }}
                border={{ base: 'none', md: '1px solid' }}
                borderColor={{ base: 'transparent', md: colorMode === 'light' ? 'gray.200' : 'rgba(255, 255, 255, 0.08)' }}
                _hover={{
                  bg: colorMode === 'light' ? 'gray.100' : 'rgba(255, 255, 255, 0.12)',
                  color: colorMode === 'light' ? 'brand.600' : 'white',
                  transform: 'translateY(-1px)',
                }}
                _active={{ transform: 'scale(0.95)' }}
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                borderRadius="full"
                display={{ base: 'flex', md: 'flex' }}
              />

              {isLoggedIn ? (
                <>
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
                  bgGradient={colorMode === 'light' ? 'linear(to-r, brand.600, brand.500)' : 'linear(to-r, brand.500, brand.400)'}
                  color="white"
                  px={6}
                  py={2}
                  borderRadius="full"
                  fontWeight="bold"
                  fontSize="sm"
                  boxShadow={colorMode === 'light' ? '0 4px 14px 0 rgba(79, 70, 229, 0.3)' : '0 4px 14px 0 rgba(99, 102, 241, 0.3)'}
                  _hover={{
                    bgGradient: colorMode === 'light' ? 'linear(to-r, brand.700, brand.600)' : 'linear(to-r, brand.600, brand.500)',
                    transform: 'translateY(-1px)',
                    boxShadow: colorMode === 'light' ? '0 6px 20px rgba(79, 70, 229, 0.4)' : '0 6px 20px rgba(99, 102, 241, 0.4)',
                    textDecoration: 'none',
                  }}
                  transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                >
                  Login
                </ChakraLink>
              )}

              <Button
                display={{ base: 'flex', md: 'none' }}
                variant="ghost"
                onClick={() => setIsSidebarOpen(true)}
                aria-label="Toggle Sidebar Menu"
                rounded="lg"
                minH="44px"
                minW="44px"
                p={0}
                _hover={{ bg: colorMode === 'light' ? 'brand.50' : 'gray.700' }}
              >
                {/* Animated Hamburger Icon */}
                <Box position="relative" w="20px" h="14px">
                  {/* Top Line */}
                  <Box
                    position="absolute"
                    h="2px"
                    w="100%"
                    bg={colorMode === 'light' ? 'gray.700' : 'gray.200'}
                    borderRadius="full"
                    transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                    top={isSidebarOpen ? '6px' : '0'}
                    transform={isSidebarOpen ? 'rotate(45deg)' : 'none'}
                  />
                  {/* Middle Line */}
                  <Box
                    position="absolute"
                    h="2px"
                    w="100%"
                    bg={colorMode === 'light' ? 'gray.700' : 'gray.200'}
                    borderRadius="full"
                    transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                    top="6px"
                    opacity={isSidebarOpen ? 0 : 1}
                    transform={isSidebarOpen ? 'translateX(10px)' : 'none'}
                  />
                  {/* Bottom Line */}
                  <Box
                    position="absolute"
                    h="2px"
                    w={isSidebarOpen ? "100%" : "75%"}
                    bg={colorMode === 'light' ? 'gray.700' : 'gray.200'}
                    borderRadius="full"
                    transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                    bottom={isSidebarOpen ? '6px' : '0'}
                    right="0"
                    transform={isSidebarOpen ? 'rotate(-45deg)' : 'none'}
                  />
                </Box>
              </Button>
            </HStack>
            </Flex>
          </Flex>
        </Container>
      </Box>

      {/* Top Hamburger Sidebar */}
      <MobileMenuDrawer
          isOpen={isSidebarOpen}
          placement="right"
          onClose={() => setIsSidebarOpen(false)}
          onProfileClick={() => setIsProfileOpen(true)}
        />

        {/* Bottom More Menu */}
        <MobileMenuDrawer
          isOpen={mobileMenuOpen}
          placement="bottom"
          onClose={() => setMobileMenuOpen(false)}
          onProfileClick={() => setIsProfileOpen(true)}
        />

        {/* Bottom Footer Navigation */}
        <MobileFooterNav
          mobileMenuOpen={mobileMenuOpen}
          onToggleMobileMenu={() => setMobileMenuOpen((open) => !open)}
        />

      <UserProfileDrawer isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </>
  );
});

export default Header;
