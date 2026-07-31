'use client';

import React from 'react';
import { Box, Flex, Icon, Link as ChakraLink, Text, useColorMode, Button } from '@chakra-ui/react';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiBookOpen, FiUser, FiGrid, FiMenu, FiMessageCircle, FiGlobe } from 'react-icons/fi';
import { observer } from 'mobx-react-lite';
import stores from '@/app/store/stores';
import { isLearnerRole, isManagerRole } from '@/app/config/utils/roleAccess';
import { PERMISSION_KEYS, hasAnyCourseViewPermission, hasPermission } from '@/app/config/utils/permissions';

interface MobileFooterNavProps {
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

export const MobileFooterNav = observer(({ mobileMenuOpen, onToggleMobileMenu }: MobileFooterNavProps) => {
  const { colorMode } = useColorMode();
  const pathname = usePathname();

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

  const bottomNavLinks = React.useMemo(() => {
    const links = [
      { href: '/', label: 'Home', icon: FiHome },
      { href: '/course', label: 'Courses', icon: FiBookOpen },
    ];

    // 3. Center Profile/Login Button
    const profileLink = isLoggedIn
      ? { href: '/dashboard', label: 'Dashboard', icon: FiUser, isCenter: true }
      : { href: '/login', label: 'Login', icon: FiUser, isCenter: true };

    links.push(profileLink);

    // 4. Fill the 4th spot so we always have exactly 5 tabs (including 'More')
    if (isLearner) {
      links.push({ href: '/chat', label: 'Community', icon: FiMessageCircle });
    } else if (isManagerUser) {
      links.push({ href: '/chat', label: 'Community', icon: FiMessageCircle });
    } else {
      links.push({ href: '/chat', label: 'Community', icon: FiMessageCircle });
    }

    // 5. Add News as the 5th tab
    links.push({ href: '/news', label: 'News', icon: FiGlobe });

    return links;
  }, [appHref, isLearner, isLoggedIn, isManagerUser]);

  return (
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
      style={{
        paddingBottom: 'var(--safe-area-bottom, env(safe-area-inset-bottom, 0px))'
      }}
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

        {/* 'More' / Hamburger Button (Commented out instead of removed)
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
          onClick={onToggleMobileMenu}
        >
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
        */}
      </Flex>
    </Box>
  );
});
