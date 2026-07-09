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
  DrawerHeader,
  DrawerOverlay,
  HStack,
  Stack,
  Text,
  useColorMode,
  Flex,
  SimpleGrid,
  VStack,
} from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import { FiHome, FiBookOpen, FiGrid, FiUsers, FiInfo, FiMail, FiUser, FiLogOut, FiChevronRight } from 'react-icons/fi';
import { Icon } from '@chakra-ui/react';
import NextLink from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { observer } from 'mobx-react-lite';
import stores from '@/app/store/stores';
import { isLearnerRole, isManagerRole } from '@/app/config/utils/roleAccess';
import { PERMISSION_KEYS, hasAnyCourseViewPermission, hasPermission } from '@/app/config/utils/permissions';

interface MobileMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  placement: 'right' | 'bottom';
  onProfileClick: () => void;
}

export const MobileMenuDrawer = observer(({ isOpen, onClose, placement, onProfileClick }: MobileMenuDrawerProps) => {
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

  const mainLinks = [
    { href: '/', label: 'Home', icon: FiHome },
    { href: '/course', label: 'Courses', icon: FiBookOpen },
    ...(isLearner ? [{ href: '/batches', label: 'Batches', icon: FiGrid }] : []),
    ...(isManagerUser ? [{ href: '/manager', label: 'Learners', icon: FiUsers }] : []),
  ];

  const infoLinks = [
    { href: '/about-us', label: 'About Us', icon: FiInfo },
    { href: '/contact-us', label: 'Contact Us', icon: FiMail },
  ];

  const handleLogout = () => {
    stores.auth.logout();
    onClose();
    router.push('/login');
  };

  const displayName = user?.name || user?.username || 'Account';

  return (
    <Drawer
      isOpen={isOpen}
      placement={placement}
      onClose={onClose}
    >
      <DrawerOverlay display={{ base: 'block', md: 'none' }} />
      <DrawerContent
        display={{ base: 'block', md: 'none' }}
        bg={colorMode === 'light' ? 'white' : '#050505'}
        borderTopRadius={placement === 'bottom' ? '3xl' : 'none'}
        borderTop={placement === 'bottom' ? '1px solid' : 'none'}
        borderColor={colorMode === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'}
        boxShadow={placement === 'bottom' ? '0 -10px 40px rgba(0,0,0,0.1)' : 'none'}
      >
        {placement === 'bottom' && (
          <Box w="48px" h="5px" bg={colorMode === 'light' ? 'gray.300' : 'gray.600'} borderRadius="full" mx="auto" mt={4} mb={2} />
        )}
        
        <DrawerCloseButton top={4} right={4} />
        <DrawerHeader display="flex" alignItems="center" px={6} h="65px" borderBottom="1px solid" borderColor={colorMode === 'light' ? 'blackAlpha.50' : 'whiteAlpha.50'}>
          <Text fontSize="xl" fontWeight="900" fontStyle="italic" letterSpacing="tighter" textTransform="uppercase" bgGradient={colorMode === 'light' ? 'linear(to-br, black, gray.500)' : 'linear(to-br, white, gray.400)'} bgClip="text">
            Settings
          </Text>
        </DrawerHeader>
        
        <DrawerBody p={0} overflowY="auto" pb={12}>
          {/* Main Navigation Group */}
          <Box px={4} pt={4} pb={2}>
            <Text fontSize="8px" fontWeight="900" color={colorMode === 'light' ? 'gray.400' : 'gray.500'} textTransform="uppercase" letterSpacing="widest" mb={2} display="flex" alignItems="center" gap={1.5}>
              <Text as="span" fontSize="14px">🧭</Text> Navigation
            </Text>
            
            {mainLinks.map((link) => {
              return (
                <NextLink key={link.href} href={link.href} passHref legacyBehavior>
                  <ChakraLink _hover={{ textDecoration: 'none' }} onClick={onClose}>
                    <Flex align="center" justify="space-between" py={3} px={2} mx={-2} borderRadius="xl" role="group" transition="all" _hover={{ bg: colorMode === 'light' ? 'blackAlpha.50' : 'whiteAlpha.50' }} _active={{ transform: 'scale(0.98)' }}>
                      <HStack spacing={3}>
                        <Flex w="28px" h="28px" borderRadius="lg" bg={colorMode === 'light' ? 'blackAlpha.50' : 'whiteAlpha.50'} align="center" justify="center" _groupHover={{ bg: colorMode === 'light' ? 'brand.50' : 'brand.900' }} transition="colors">
                          <Icon as={link.icon} boxSize="16px" color={colorMode === 'light' ? 'gray.500' : 'gray.400'} _groupHover={{ color: colorMode === 'light' ? 'brand.600' : 'brand.300' }} transition="colors" />
                        </Flex>
                        <Text fontSize="12px" fontWeight="bold" textTransform="uppercase" letterSpacing="wide" color={colorMode === 'light' ? 'blackAlpha.900' : 'whiteAlpha.900'} _groupHover={{ transform: 'translateX(4px)' }} transition="transform">
                          {link.label}
                        </Text>
                      </HStack>
                      <Icon as={FiChevronRight} boxSize="16px" color={colorMode === 'light' ? 'gray.300' : 'gray.600'} />
                    </Flex>
                  </ChakraLink>
                </NextLink>
              );
            })}
          </Box>

          {/* Info & Support Group */}
          <Box px={4} py={2}>
            <Text fontSize="8px" fontWeight="900" color={colorMode === 'light' ? 'gray.400' : 'gray.500'} textTransform="uppercase" letterSpacing="widest" mb={2} display="flex" alignItems="center" gap={1.5}>
              <Text as="span" fontSize="14px">🛠️</Text> Support & Info
            </Text>
            
            {infoLinks.map((link) => {
              return (
                <NextLink key={link.href} href={link.href} passHref legacyBehavior>
                  <ChakraLink _hover={{ textDecoration: 'none' }} onClick={onClose}>
                    <Flex align="center" justify="space-between" py={3} px={2} mx={-2} borderRadius="xl" role="group" transition="all" _hover={{ bg: colorMode === 'light' ? 'blackAlpha.50' : 'whiteAlpha.50' }} _active={{ transform: 'scale(0.98)' }}>
                      <HStack spacing={3}>
                        <Flex w="28px" h="28px" borderRadius="lg" bg={colorMode === 'light' ? 'blackAlpha.50' : 'whiteAlpha.50'} align="center" justify="center" _groupHover={{ bg: colorMode === 'light' ? 'brand.50' : 'brand.900' }} transition="colors">
                          <Icon as={link.icon} boxSize="16px" color={colorMode === 'light' ? 'gray.500' : 'gray.400'} _groupHover={{ color: colorMode === 'light' ? 'brand.600' : 'brand.300' }} transition="colors" />
                        </Flex>
                        <Text fontSize="12px" fontWeight="bold" textTransform="uppercase" letterSpacing="wide" color={colorMode === 'light' ? 'blackAlpha.900' : 'whiteAlpha.900'} _groupHover={{ transform: 'translateX(4px)' }} transition="transform">
                          {link.label}
                        </Text>
                      </HStack>
                      <Icon as={FiChevronRight} boxSize="16px" color={colorMode === 'light' ? 'gray.300' : 'gray.600'} />
                    </Flex>
                  </ChakraLink>
                </NextLink>
              );
            })}
          </Box>

          {/* Account Group */}
          <Box px={4} py={2}>
            <Text fontSize="8px" fontWeight="900" color={colorMode === 'light' ? 'gray.400' : 'gray.500'} textTransform="uppercase" letterSpacing="widest" mb={2} display="flex" alignItems="center" gap={1.5}>
              <Text as="span" fontSize="14px">👤</Text> Account
            </Text>

            <Flex 
              as="button" w="full" onClick={toggleColorMode} 
              align="center" justify="space-between" py={3} px={2} mx={-2} borderRadius="xl" 
              role="group" transition="all" _hover={{ bg: colorMode === 'light' ? 'blackAlpha.50' : 'whiteAlpha.50' }} _active={{ transform: 'scale(0.98)' }}
            >
              <HStack spacing={3}>
                <Flex w="28px" h="28px" borderRadius="lg" bg={colorMode === 'light' ? 'blackAlpha.50' : 'whiteAlpha.50'} align="center" justify="center" _groupHover={{ bg: colorMode === 'light' ? 'brand.50' : 'brand.900' }} transition="colors">
                  <Icon as={colorMode === 'light' ? MoonIcon : SunIcon} boxSize="16px" color={colorMode === 'light' ? 'gray.500' : 'gray.400'} _groupHover={{ color: colorMode === 'light' ? 'brand.600' : 'brand.300' }} transition="colors" />
                </Flex>
                <Text fontSize="12px" fontWeight="bold" textTransform="uppercase" letterSpacing="wide" color={colorMode === 'light' ? 'blackAlpha.900' : 'whiteAlpha.900'} _groupHover={{ transform: 'translateX(4px)' }} transition="transform">
                  {colorMode === 'light' ? 'Dark Mode' : 'Light Mode'}
                </Text>
              </HStack>
            </Flex>

            {isLoggedIn && (
              <>
                <Flex 
                  as="button" w="full" onClick={() => { onClose(); onProfileClick(); }} 
                  align="center" justify="space-between" py={3} px={2} mx={-2} borderRadius="xl" 
                  role="group" transition="all" _hover={{ bg: colorMode === 'light' ? 'blackAlpha.50' : 'whiteAlpha.50' }} _active={{ transform: 'scale(0.98)' }}
                >
                  <HStack spacing={3}>
                    <Flex w="28px" h="28px" borderRadius="lg" bg={colorMode === 'light' ? 'blackAlpha.50' : 'whiteAlpha.50'} align="center" justify="center" _groupHover={{ bg: colorMode === 'light' ? 'brand.50' : 'brand.900' }} transition="colors">
                      <Icon as={FiUser} boxSize="16px" color={colorMode === 'light' ? 'gray.500' : 'gray.400'} _groupHover={{ color: colorMode === 'light' ? 'brand.600' : 'brand.300' }} transition="colors" />
                    </Flex>
                    <Text fontSize="12px" fontWeight="bold" textTransform="uppercase" letterSpacing="wide" color={colorMode === 'light' ? 'blackAlpha.900' : 'whiteAlpha.900'} _groupHover={{ transform: 'translateX(4px)' }} transition="transform">
                      View Profile
                    </Text>
                  </HStack>
                  <Icon as={FiChevronRight} boxSize="16px" color={colorMode === 'light' ? 'gray.300' : 'gray.600'} />
                </Flex>

                <Flex 
                  as="button" w="full" onClick={() => { router.push(appHref); onClose(); }} 
                  align="center" justify="space-between" py={3} px={2} mx={-2} borderRadius="xl" 
                  role="group" transition="all" _hover={{ bg: colorMode === 'light' ? 'blackAlpha.50' : 'whiteAlpha.50' }} _active={{ transform: 'scale(0.98)' }}
                >
                  <HStack spacing={3}>
                    <Flex w="28px" h="28px" borderRadius="lg" bg={colorMode === 'light' ? 'blackAlpha.50' : 'whiteAlpha.50'} align="center" justify="center" _groupHover={{ bg: colorMode === 'light' ? 'brand.50' : 'brand.900' }} transition="colors">
                      <Icon as={FiBookOpen} boxSize="16px" color={colorMode === 'light' ? 'gray.500' : 'gray.400'} _groupHover={{ color: colorMode === 'light' ? 'brand.600' : 'brand.300' }} transition="colors" />
                    </Flex>
                    <Text fontSize="12px" fontWeight="bold" textTransform="uppercase" letterSpacing="wide" color={colorMode === 'light' ? 'blackAlpha.900' : 'whiteAlpha.900'} _groupHover={{ transform: 'translateX(4px)' }} transition="transform">
                      {isLearner ? 'My Learning' : 'Dashboard'}
                    </Text>
                  </HStack>
                  <Icon as={FiChevronRight} boxSize="16px" color={colorMode === 'light' ? 'gray.300' : 'gray.600'} />
                </Flex>
              </>
            )}
          </Box>

          {/* Account Actions Group (Logout) */}
          <Box px={4} py={2}>
            {isLoggedIn ? (
              <>
                <Text fontSize="8px" fontWeight="900" color={colorMode === 'light' ? 'gray.400' : 'gray.500'} textTransform="uppercase" letterSpacing="widest" mb={2} display="flex" alignItems="center" gap={1.5}>
                  <Text as="span" fontSize="14px">⚙️</Text> Account Actions
                </Text>
                <Flex 
                  as="button" w="full" onClick={() => { handleLogout(); onClose(); }} 
                  align="center" justify="space-between" py={3} px={2} mx={-2} borderRadius="xl" 
                  transition="all" _hover={{ bg: colorMode === 'light' ? 'red.50' : 'rgba(239, 68, 68, 0.1)' }} _active={{ transform: 'scale(0.98)' }}
                  color="red.500" role="group"
                >
                  <HStack spacing={3}>
                    <Flex w="28px" h="28px" borderRadius="lg" bg={colorMode === 'light' ? 'red.50' : 'rgba(239,68,68,0.1)'} align="center" justify="center" _groupHover={{ bg: 'red.500' }} transition="colors">
                      <Icon as={FiLogOut} boxSize="16px" color="red.500" _groupHover={{ color: 'white' }} transition="colors" />
                    </Flex>
                    <Text fontSize="12px" fontWeight="bold" textTransform="uppercase" letterSpacing="wide" color="red.500" _groupHover={{ transform: 'translateX(4px)' }} transition="transform">
                      Unplug (Log Out)
                    </Text>
                  </HStack>
                </Flex>
              </>
            ) : (
              <NextLink href="/login" passHref legacyBehavior>
                <ChakraLink _hover={{ textDecoration: 'none' }} onClick={onClose}>
                  <Flex 
                    align="center" justify="center" py={4} mt={4} 
                    bgGradient={colorMode === 'light' ? 'linear(to-r, brand.600, brand.500)' : 'linear(to-r, brand.500, brand.400)'} 
                    borderRadius="xl" color="white" fontWeight="bold" fontSize="14px" textTransform="uppercase"
                    boxShadow={colorMode === 'light' ? '0 4px 14px 0 rgba(79, 70, 229, 0.3)' : '0 4px 14px 0 rgba(99, 102, 241, 0.3)'}
                  >
                    <HStack spacing={2}>
                      <Icon as={FiUser} boxSize="16px" />
                      <Text>Login</Text>
                    </HStack>
                  </Flex>
                </ChakraLink>
              </NextLink>
            )}
          </Box>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
});
