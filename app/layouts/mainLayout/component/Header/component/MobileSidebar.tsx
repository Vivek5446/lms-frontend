'use client';

import React from 'react';
import {
  Avatar,
  Box,
  Button,
  Link as ChakraLink,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  HStack,
  Stack,
  Text,
  useColorMode,
} from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import NextLink from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { observer } from 'mobx-react-lite';
import stores from '@/app/store/stores';
import { isLearnerRole, isManagerRole } from '@/app/config/utils/roleAccess';
import { PERMISSION_KEYS, hasAnyCourseViewPermission, hasPermission } from '@/app/config/utils/permissions';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileClick: () => void;
}

export const MobileSidebar = observer(({ isOpen, onClose, onProfileClick }: MobileSidebarProps) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const pathname = usePathname();
  const router = useRouter();

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

  // YOU CAN CUSTOMIZE THESE SIDEBAR TABS HERE DIFFERENTLY FROM THE MORE MENU
  const sidebarNavLinks = React.useMemo(() => ([
    { href: '/', label: 'Home' },
    { href: '/course', label: 'Courses' },
    { href: '/quiz', label: 'Quiz' },
    ...(isLearner ? [{ href: '/batches', label: 'Batches' }] : []),
    ...(isManagerUser ? [{ href: '/manager', label: 'Learners' }] : []),
    { href: '/chat', label: 'Community' },
    { href: '/about-us', label: 'About Us' },
    { href: '/contact-us', label: 'Contact Us' },
  ]), [isLearner, isManagerUser]);

  const handleLogout = () => {
    stores.auth.logout();
    onClose();
    router.push('/login');
  };

  const displayName = user?.name || user?.username || 'Account';

  return (
    <Drawer
      isOpen={isOpen}
      placement="right"
      onClose={onClose}
    >
      <DrawerOverlay display={{ base: 'block', md: 'none' }} />
      <DrawerContent
        display={{ base: 'block', md: 'none' }}
        bg={colorMode === 'light' ? 'white' : 'gray.800'}
      >
        <DrawerCloseButton top={3} right={4} />
        <DrawerBody pb="calc(24px + env(safe-area-inset-bottom))" px={4} pt={12}>
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

            {sidebarNavLinks.map((link) => (
              <ChakraLink
                key={link.href}
                as={NextLink}
                href={link.href}
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
                onClick={onClose}
              >
                {link.label}
              </ChakraLink>
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
                    onClose();
                    onProfileClick();
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
                  onClick={onClose}
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
              <ChakraLink
                as={NextLink}
                href="/login"
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
                onClick={onClose}
                _hover={{
                  textDecoration: 'none',
                  bg: colorMode === 'light' ? 'brand.700' : 'brand.600',
                  transform: 'translateY(-2px)'
                }}
                transition="all 0.2s"
              >
                Login
              </ChakraLink>
            )}
          </Stack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
});
