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
import { FiHome, FiBookOpen, FiGrid, FiUsers, FiInfo, FiMail, FiUser, FiLogOut, FiChevronRight, FiArrowLeft } from 'react-icons/fi';
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
        bg={colorMode === 'light' ? '#FFFFFA' : 'gray.900'}
        borderTopRadius="none"
        borderTop={placement === 'bottom' ? '1px solid' : 'none'}
        borderColor={colorMode === 'light' ? 'gray.200' : 'gray.700'}
        boxShadow={placement === 'bottom' ? '0 -10px 40px rgba(0,0,0,0.1)' : 'none'}
        h="100vh"
      >
        <Box
          w="100%"
          px={5}
          py={4}
          bg={colorMode === 'light' ? '#FFFFFA' : 'gray.900'}
          borderBottom="1px solid"
          borderColor={colorMode === 'light' ? 'gray.200' : 'gray.700'}
          position="sticky"
          top={0}
          zIndex={20}
        >
          <HStack spacing={4} align="center">
            <Button
              onClick={onClose}
              variant="solid"
              borderRadius="full"
              p={0}
              w="36px" h="36px" minW="36px"
              bg={colorMode === 'light' ? 'gray.100' : 'gray.700'}
              color={colorMode === 'light' ? 'gray.700' : 'gray.200'}
              border="1px solid"
              borderColor={colorMode === 'light' ? 'gray.200' : 'gray.600'}
              boxShadow="sm"
              _hover={{ bg: colorMode === 'light' ? 'gray.200' : 'gray.600', transform: "scale(1.05)" }}
              _active={{ transform: "scale(0.95)" }}
              transition="all 0.2s"
              flexShrink={0}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Icon as={FiArrowLeft} boxSize="16px" />
            </Button>
            <Box>
              <Text fontSize="xl" fontWeight="900" letterSpacing="tight" lineHeight="1.2">
                <Box as="span" color={colorMode === 'light' ? 'gray.900' : 'white'} textTransform="uppercase">APP </Box>
                <Box as="span" bgGradient={colorMode === 'light' ? 'linear(to-r, brand.500, brand.700)' : 'linear(to-r, brand.300, brand.500)'} bgClip="text" textTransform="uppercase">
                  SETTINGS
                </Box>
              </Text>
              <Text fontSize="10px" color={colorMode === 'light' ? 'gray.600' : 'gray.400'} fontWeight="700" letterSpacing="0.2em" mt={0.5}>
                MANAGE YOUR PREFERENCES
              </Text>
            </Box>
          </HStack>
        </Box>
        
        <DrawerBody p={0} overflowY="auto" pb={{ base: 24, sm: 16 }}>
          {/* Main Navigation Group */}
          <Box px={4} pt={6} pb={2}>
            <Text fontSize="8px" fontWeight="900" color={colorMode === 'light' ? 'gray.400' : 'gray.500'} textTransform="uppercase" letterSpacing="widest" mb={2} display="flex" alignItems="center" gap={1.5}>
              <Text as="span" fontSize="14px">🧭</Text> Navigation
            </Text>
            
            {mainLinks.map((link) => {
              return (
                <NextLink key={link.href} href={link.href} passHref legacyBehavior>
                  <ChakraLink _hover={{ textDecoration: 'none' }} onClick={onClose}>
                    <Flex align="center" justify="space-between" py={2.5} px={2} mx={-2} borderRadius="xl" role="group" transition="all" _hover={{ bg: colorMode === 'light' ? 'blackAlpha.50' : 'whiteAlpha.50' }} _active={{ transform: 'scale(0.98)' }}>
                      <HStack spacing={4}>
                        <Flex w="32px" h="32px" borderRadius="lg" bg={colorMode === 'light' ? 'blackAlpha.50' : 'whiteAlpha.50'} align="center" justify="center" _groupHover={{ bg: colorMode === 'light' ? 'brand.50' : 'brand.900' }} transition="colors">
                          <Icon as={link.icon} boxSize="16px" color={colorMode === 'light' ? 'gray.500' : 'gray.400'} _groupHover={{ color: colorMode === 'light' ? 'brand.600' : 'brand.300' }} transition="colors" />
                        </Flex>
                        <Text fontSize="14px" fontWeight="600" color={colorMode === 'light' ? 'gray.700' : 'gray.200'} _groupHover={{ transform: 'translateX(4px)', color: colorMode === 'light' ? 'brand.600' : 'brand.300' }} transition="all 0.2s">
                          {link.label}
                        </Text>
                      </HStack>
                    </Flex>
                  </ChakraLink>
                </NextLink>
              );
            })}
          </Box>

          {/* Info & Support Group */}
          <Box px={4} py={2}>
            <Text fontSize="10px" fontWeight="800" color={colorMode === 'light' ? 'gray.400' : 'gray.500'} textTransform="uppercase" letterSpacing="0.15em" mb={2} pl={1}>
              SUPPORT & INFO
            </Text>
            
            {infoLinks.map((link) => {
              return (
                <NextLink key={link.href} href={link.href} passHref legacyBehavior>
                  <ChakraLink _hover={{ textDecoration: 'none' }} onClick={onClose}>
                    <Flex align="center" justify="space-between" py={2.5} px={2} mx={-2} borderRadius="xl" role="group" transition="all" _hover={{ bg: colorMode === 'light' ? 'blackAlpha.50' : 'whiteAlpha.50' }} _active={{ transform: 'scale(0.98)' }}>
                      <HStack spacing={4}>
                        <Flex w="32px" h="32px" borderRadius="lg" bg={colorMode === 'light' ? 'blackAlpha.50' : 'whiteAlpha.50'} align="center" justify="center" _groupHover={{ bg: colorMode === 'light' ? 'brand.50' : 'brand.900' }} transition="colors">
                          <Icon as={link.icon} boxSize="16px" color={colorMode === 'light' ? 'gray.500' : 'gray.400'} _groupHover={{ color: colorMode === 'light' ? 'brand.600' : 'brand.300' }} transition="colors" />
                        </Flex>
                        <Text fontSize="14px" fontWeight="600" color={colorMode === 'light' ? 'gray.700' : 'gray.200'} _groupHover={{ transform: 'translateX(4px)', color: colorMode === 'light' ? 'brand.600' : 'brand.300' }} transition="all 0.2s">
                          {link.label}
                        </Text>
                      </HStack>
                    </Flex>
                  </ChakraLink>
                </NextLink>
              );
            })}
          </Box>

          {/* Account Group */}
          <Box px={4} py={2}>
            <Text fontSize="10px" fontWeight="800" color={colorMode === 'light' ? 'gray.400' : 'gray.500'} textTransform="uppercase" letterSpacing="0.15em" mb={2} pl={1}>
              ACCOUNT
            </Text>

            <Flex 
              as="button" w="full" onClick={toggleColorMode} 
              align="center" justify="space-between" py={2.5} px={2} mx={-2} borderRadius="xl" 
              role="group" transition="all" _hover={{ bg: colorMode === 'light' ? 'blackAlpha.50' : 'whiteAlpha.50' }} _active={{ transform: 'scale(0.98)' }}
            >
              <HStack spacing={4}>
                <Flex w="32px" h="32px" borderRadius="lg" bg={colorMode === 'light' ? 'blackAlpha.50' : 'whiteAlpha.50'} align="center" justify="center" _groupHover={{ bg: colorMode === 'light' ? 'brand.50' : 'brand.900' }} transition="colors">
                  <Icon as={colorMode === 'light' ? MoonIcon : SunIcon} boxSize="16px" color={colorMode === 'light' ? 'gray.500' : 'gray.400'} _groupHover={{ color: colorMode === 'light' ? 'brand.600' : 'brand.300' }} transition="colors" />
                </Flex>
                <Text fontSize="14px" fontWeight="600" color={colorMode === 'light' ? 'gray.700' : 'gray.200'} _groupHover={{ transform: 'translateX(4px)', color: colorMode === 'light' ? 'brand.600' : 'brand.300' }} transition="all 0.2s">
                  {colorMode === 'light' ? 'Dark Mode' : 'Light Mode'}
                </Text>
              </HStack>
            </Flex>

            {isLoggedIn && (
              <>
                <Flex 
                  as="button" w="full" onClick={() => { onClose(); onProfileClick(); }} 
                  align="center" justify="space-between" py={2.5} px={2} mx={-2} borderRadius="xl" 
                  role="group" transition="all" _hover={{ bg: colorMode === 'light' ? 'blackAlpha.50' : 'whiteAlpha.50' }} _active={{ transform: 'scale(0.98)' }}
                >
                  <HStack spacing={4}>
                    <Flex w="32px" h="32px" borderRadius="lg" bg={colorMode === 'light' ? 'blackAlpha.50' : 'whiteAlpha.50'} align="center" justify="center" _groupHover={{ bg: colorMode === 'light' ? 'brand.50' : 'brand.900' }} transition="colors">
                      <Icon as={FiUser} boxSize="16px" color={colorMode === 'light' ? 'gray.500' : 'gray.400'} _groupHover={{ color: colorMode === 'light' ? 'brand.600' : 'brand.300' }} transition="colors" />
                    </Flex>
                    <Text fontSize="14px" fontWeight="600" color={colorMode === 'light' ? 'gray.700' : 'gray.200'} _groupHover={{ transform: 'translateX(4px)', color: colorMode === 'light' ? 'brand.600' : 'brand.300' }} transition="all 0.2s">
                      View Profile
                    </Text>
                  </HStack>
                </Flex>

                <Flex 
                  as="button" w="full" onClick={() => { router.push(appHref); onClose(); }} 
                  align="center" justify="space-between" py={2.5} px={2} mx={-2} borderRadius="xl" 
                  role="group" transition="all" _hover={{ bg: colorMode === 'light' ? 'blackAlpha.50' : 'whiteAlpha.50' }} _active={{ transform: 'scale(0.98)' }}
                >
                  <HStack spacing={4}>
                    <Flex w="32px" h="32px" borderRadius="lg" bg={colorMode === 'light' ? 'blackAlpha.50' : 'whiteAlpha.50'} align="center" justify="center" _groupHover={{ bg: colorMode === 'light' ? 'brand.50' : 'brand.900' }} transition="colors">
                      <Icon as={FiBookOpen} boxSize="16px" color={colorMode === 'light' ? 'gray.500' : 'gray.400'} _groupHover={{ color: colorMode === 'light' ? 'brand.600' : 'brand.300' }} transition="colors" />
                    </Flex>
                    <Text fontSize="14px" fontWeight="600" color={colorMode === 'light' ? 'gray.700' : 'gray.200'} _groupHover={{ transform: 'translateX(4px)', color: colorMode === 'light' ? 'brand.600' : 'brand.300' }} transition="all 0.2s">
                      {isLearner ? 'My Learning' : 'Dashboard'}
                    </Text>
                  </HStack>
                </Flex>
              </>
            )}
          </Box>
        </DrawerBody>

        {/* ── Sticky Footer (Logout / Login) ── */}
        <Box
          position="absolute" bottom={0} left={0} right={0}
          bg={colorMode === 'light' ? 'linear-gradient(to top, #FFFFFA 70%, transparent)' : 'linear-gradient(to top, #171923 70%, transparent)'}
          px={5} pb={{ base: 16, sm: 10 }} pt={10}
          zIndex={20}
        >
          {isLoggedIn ? (
            <Button
              w="full" h="52px"
              borderRadius="xl"
              bg={colorMode === 'light' ? 'red.50' : 'rgba(239, 68, 68, 0.1)'}
              color="red.500"
              fontSize="14px" fontWeight="bold" letterSpacing="wide"
              onClick={() => { handleLogout(); onClose(); }}
              leftIcon={<FiLogOut size={18} />}
              _hover={{ bg: colorMode === 'light' ? 'red.100' : 'rgba(239, 68, 68, 0.2)', transform: 'translateY(-2px)' }}
              _active={{ transform: 'translateY(0)' }}
              transition="all 0.2s"
            >
              UNPLUG (LOG OUT)
            </Button>
          ) : (
            <Button
              w="full" h="52px"
              borderRadius="xl"
              bgGradient={colorMode === 'light' ? 'linear(to-r, brand.600, brand.500)' : 'linear(to-r, brand.500, brand.400)'}
              color="white"
              fontSize="14px" fontWeight="bold" letterSpacing="wide" textTransform="uppercase"
              onClick={() => { router.push('/login'); onClose(); }}
              leftIcon={<FiUser size={18} />}
              boxShadow={colorMode === 'light' ? '0 4px 14px 0 rgba(79, 70, 229, 0.3)' : '0 4px 14px 0 rgba(99, 102, 241, 0.3)'}
              _hover={{ bgGradient: colorMode === 'light' ? 'linear(to-r, brand.700, brand.600)' : 'linear(to-r, brand.600, brand.500)', transform: 'translateY(-2px)' }}
              _active={{ transform: 'translateY(0)' }}
              transition="all 0.2s"
            >
              LOGIN
            </Button>
          )}
        </Box>
      </DrawerContent>
    </Drawer>
  );
});
