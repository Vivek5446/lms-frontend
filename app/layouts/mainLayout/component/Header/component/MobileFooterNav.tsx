'use client';

import stores from '@/app/store/stores';
import {
  Box,
  Link as ChakraLink,
  Flex,
  Icon,
  Text,
  useColorMode,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { observer } from 'mobx-react-lite';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import type { IconType } from 'react-icons';
import {
  FiBookOpen,
  FiGlobe,
  FiHome,
  FiMessageCircle,
  FiUser,
} from 'react-icons/fi';

interface MobileFooterNavProps {
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

interface BottomNavLink {
  href: string;
  label: string;
  icon: IconType;
  isCenter?: boolean;
}

const indicatorEntrance = keyframes`
  0% {
    opacity: 0;
    transform: translateY(-5px) scaleX(0.4);
  }

  100% {
    opacity: 1;
    transform: translateY(0) scaleX(1);
  }
`;

const centerFloat = keyframes`
  0%, 100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-3px);
  }
`;

const centerPulse = keyframes`
  0% {
    opacity: 0.45;
    transform: scale(0.9);
  }

  70% {
    opacity: 0;
    transform: scale(1.28);
  }

  100% {
    opacity: 0;
    transform: scale(1.28);
  }
`;

export const MobileFooterNav = observer(
  ({
    mobileMenuOpen,
    onToggleMobileMenu,
  }: MobileFooterNavProps) => {
    const { colorMode } = useColorMode();
    const pathname = usePathname();

    const user = stores.auth.user;
    const isLoggedIn = Boolean(user);
    const isLight = colorMode === 'light';

    const bottomNavLinks = React.useMemo<BottomNavLink[]>(() => {
      return [
        {
          href: isLoggedIn ? '/user-profile' : '/login',
          label: 'Profile',
          icon: FiUser,
        },
        {
          href: '/course',
          label: 'Courses',
          icon: FiBookOpen,
        },
        {
          href: '/',
          label: 'Home',
          icon: FiHome,
          isCenter: true,
        },
        {
          href: '/chat',
          label: 'Community',
          icon: FiMessageCircle,
        },
        {
          href: '/news',
          label: 'News',
          icon: FiGlobe,
        },
      ];
    }, [isLoggedIn]);

    return (
      <Box
        display={{ base: 'block', md: 'none' }}
        position="fixed"
        left="0"
        right="0"
        bottom="0"
        zIndex="1000"
        isolation="isolate"
        bg={
          isLight
            ? 'rgba(255, 255, 255, 0.95)'
            : 'rgba(5, 5, 5, 0.95)'
        }
        borderTop="1px solid"
        borderColor={isLight ? 'gray.200' : 'gray.800'}
        backdropFilter="blur(24px)"
        boxShadow={
          isLight
            ? '0 -8px 30px rgba(0, 0, 0, 0.05)'
            : '0 -8px 30px rgba(0, 0, 0, 0.55)'
        }
        transition="background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease"
        data-mobile-menu-open={mobileMenuOpen}
        data-has-toggle-handler={typeof onToggleMobileMenu === 'function'}
        style={{
          paddingBottom:
            'var(--safe-area-bottom, env(safe-area-inset-bottom, 0px))',
        }}
        _before={{
          content: '""',
          position: 'absolute',
          top: '-1px',
          left: '50%',
          width: '46%',
          height: '1px',
          transform: 'translateX(-50%)',
          bg: isLight ? 'brand.500' : 'brand.400',
          opacity: 0.18,
          pointerEvents: 'none',
        }}
      >
        <Flex
          h="68px"
          w="full"
          maxW="520px"
          mx="auto"
          px={2}
          position="relative"
          align="center"
          justify="space-around"
        >
          {bottomNavLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== '/' && pathname.startsWith(link.href));

            const isCenter = Boolean(link.isCenter);

            const inactiveColor = isLight ? 'gray.400' : 'gray.500';
            const activeColor = isLight ? 'brand.600' : 'brand.400';

            return (
              <ChakraLink
                key={link.href}
                as={NextLink}
                href={link.href}
                aria-label={link.label}
                aria-current={isActive ? 'page' : undefined}
                position="relative"
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                flex={isCenter ? '0 0 64px' : '1'}
                minW="0"
                maxW={isCenter ? '64px' : '76px'}
                h={isCenter ? '64px' : '56px'}
                mt={isCenter ? '-36px' : '0'}
                borderRadius={isCenter ? 'full' : '18px'}
                border={isCenter ? '5px solid' : '1px solid transparent'}
                borderColor={
                  isCenter
                    ? isLight
                      ? 'white'
                      : 'gray.900'
                    : 'transparent'
                }
                bgGradient={
                  isCenter
                    ? isLight
                      ? 'linear(to-br, brand.400, brand.600)'
                      : 'linear(to-br, brand.500, brand.700)'
                    : 'none'
                }
                color={
                  isCenter
                    ? 'white'
                    : isActive
                      ? activeColor
                      : inactiveColor
                }
                boxShadow={
                  isCenter
                    ? isLight
                      ? '0 12px 26px -7px var(--chakra-colors-brand-500)'
                      : '0 12px 26px -7px rgba(0, 0, 0, 0.85)'
                    : 'none'
                }
                transform="translateZ(0)"
                transition={[
                  'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  'color 0.25s ease',
                  'background-color 0.25s ease',
                  'box-shadow 0.25s ease',
                ].join(', ')}
                zIndex={isCenter ? 10 : 1}
                textDecoration="none"
                _hover={{
                  textDecoration: 'none',
                  transform: isCenter
                    ? 'translateY(-3px) scale(1.03)'
                    : 'translateY(-2px)',
                }}
                _active={{
                  transform: isCenter
                    ? 'translateY(0) scale(0.92)'
                    : 'scale(0.94)',
                }}
                _focusVisible={{
                  outline: '2px solid',
                  outlineColor: isLight ? 'brand.500' : 'brand.400',
                  outlineOffset: '3px',
                }}
                sx={{
                  WebkitTapHighlightColor: 'transparent',

                  '@media (prefers-reduced-motion: reduce)': {
                    animation: 'none !important',
                    transition: 'none !important',
                  },
                }}
                _before={
                  isCenter
                    ? {
                        content: '""',
                        position: 'absolute',
                        inset: '-5px',
                        borderRadius: 'full',
                        border: '2px solid',
                        borderColor: isLight ? 'brand.400' : 'brand.500',
                        opacity: isActive ? 0 : 0,
                        animation: isActive
                          ? `${centerPulse} 2.4s ease-out infinite`
                          : 'none',
                        pointerEvents: 'none',
                        zIndex: -1,
                      }
                    : {
                        content: '""',
                        position: 'absolute',
                        inset: '5px 4px',
                        borderRadius: '16px',
                        bg: isLight ? 'brand.50' : 'whiteAlpha.100',
                        opacity: isActive ? 1 : 0,
                        transform: isActive ? 'scale(1)' : 'scale(0.8)',
                        transition:
                          'opacity 0.25s ease, transform 0.25s ease',
                        pointerEvents: 'none',
                        zIndex: -1,
                      }
                }
                _after={
                  isCenter
                    ? {
                        content: '""',
                        position: 'absolute',
                        top: '7px',
                        left: '12px',
                        width: '22px',
                        height: '8px',
                        borderRadius: 'full',
                        bg: 'white',
                        opacity: 0.18,
                        transform: 'rotate(-20deg)',
                        pointerEvents: 'none',
                      }
                    : undefined
                }
              >
                {isActive && !isCenter && (
                  <Box
                    position="absolute"
                    top="-7px"
                    h="3px"
                    w="28px"
                    borderBottomRadius="full"
                    bg={isLight ? 'brand.500' : 'brand.400'}
                    boxShadow={
                      isLight
                        ? '0 3px 10px var(--chakra-colors-brand-200)'
                        : '0 3px 10px var(--chakra-colors-brand-800)'
                    }
                    animation={`${indicatorEntrance} 0.32s cubic-bezier(0.34, 1.56, 0.64, 1)`}
                  />
                )}

                <Box
                  position="relative"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  w={isCenter ? '40px' : '34px'}
                  h={isCenter ? '40px' : '30px'}
                  borderRadius="full"
                  animation={
                    isCenter && isActive
                      ? `${centerFloat} 3s ease-in-out infinite`
                      : 'none'
                  }
                  transition="transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"
                >
                  <Icon
                    as={link.icon}
                    boxSize={isCenter ? '26px' : '21px'}
                    strokeWidth={isActive ? 2.3 : 2}
                    transition={[
                      'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      'filter 0.25s ease',
                    ].join(', ')}
                    transform={
                      !isCenter && isActive
                        ? 'translateY(-1px) scale(1.12)'
                        : 'translateY(0) scale(1)'
                    }
                    filter={
                      isActive && !isCenter
                        ? isLight
                          ? 'drop-shadow(0 3px 5px var(--chakra-colors-brand-100))'
                          : 'drop-shadow(0 3px 5px var(--chakra-colors-brand-800))'
                        : 'none'
                    }
                  />
                </Box>

                {!isCenter && (
                  <Text
                    mt="1px"
                    px={1}
                    maxW="full"
                    overflow="hidden"
                    textOverflow="ellipsis"
                    whiteSpace="nowrap"
                    fontSize="10px"
                    fontWeight={isActive ? '700' : '500'}
                    lineHeight="1"
                    letterSpacing={isActive ? '0.01em' : 'normal'}
                    color={isActive ? activeColor : inactiveColor}
                    opacity={isActive ? 1 : 0.9}
                    transform={
                      isActive ? 'translateY(0)' : 'translateY(1px)'
                    }
                    transition={[
                      'color 0.25s ease',
                      'opacity 0.25s ease',
                      'transform 0.25s ease',
                      'font-weight 0.25s ease',
                    ].join(', ')}
                  >
                    {link.label}
                  </Text>
                )}
              </ChakraLink>
            );
          })}
        </Flex>
      </Box>
    );
  },
);



// 'use client';

// import stores from '@/app/store/stores';
// import { Box, Link as ChakraLink, Flex, Icon, Text, useColorMode } from '@chakra-ui/react';
// import { observer } from 'mobx-react-lite';
// import NextLink from 'next/link';
// import { usePathname } from 'next/navigation';
// import React from 'react';
// import type { IconType } from 'react-icons';
// import { FiBookOpen, FiGlobe, FiHome, FiMessageCircle, FiUser } from 'react-icons/fi';

// interface MobileFooterNavProps {
//   mobileMenuOpen: boolean;
//   onToggleMobileMenu: () => void;
// }

// interface BottomNavLink {
//   href: string;
//   label: string;
//   icon: IconType;
//   isCenter?: boolean;
// }

// export const MobileFooterNav = observer(({ mobileMenuOpen, onToggleMobileMenu }: MobileFooterNavProps) => {
//   const { colorMode } = useColorMode();
//   const pathname = usePathname();

//   const user = stores.auth.user;
//   const isLoggedIn = Boolean(user);

//   const bottomNavLinks = React.useMemo(() => {
//     const links: BottomNavLink[] = [
//       { href: isLoggedIn ? '/user-profile' : '/login', label: 'Profile', icon: FiUser },
//       { href: '/course', label: 'Courses', icon: FiBookOpen },
//     ];

//     links.push({ href: '/', label: 'Home', icon: FiHome, isCenter: true });

//     // 4. Fill the 4th spot so we always have exactly 5 tabs (including 'More')
//     links.push({ href: '/chat', label: 'Community', icon: FiMessageCircle });

//     // 5. Add News as the 5th tab
//     links.push({ href: '/news', label: 'News', icon: FiGlobe });

//     return links;
//   }, [isLoggedIn]);

//   return (
//     <Box
//       display={{ base: 'block', md: 'none' }}
//       position="fixed"
//       left="0"
//       right="0"
//       bottom="0"
//       zIndex="1000"
//       bg={colorMode === 'light' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(5, 5, 5, 0.95)'}
//       borderTop="1px solid"
//       borderColor={colorMode === 'light' ? 'gray.200' : 'gray.800'}
//       backdropFilter="blur(24px)"
//       boxShadow={colorMode === 'light' ? '0 -4px 30px rgba(0, 0, 0, 0.04)' : '0 -4px 30px rgba(0, 0, 0, 0.5)'}
//       style={{
//         paddingBottom: 'var(--safe-area-bottom, env(safe-area-inset-bottom, 0px))'
//       }}
//     >
//       <Flex
//         h="68px"
//         w="full"
//         maxW="520px"
//         mx="auto"
//         align="center"
//         justify="space-around"
//         px={2}
//         position="relative"
//       >
//         {bottomNavLinks.map((link) => {
//           const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
//           const isCenter = link.isCenter;

//           return (
//             <ChakraLink
//               key={link.href}
//               as={NextLink}
//               href={link.href}
//               position="relative"
//               display="flex"
//               flexDirection="column"
//               alignItems="center"
//               justifyContent="center"
//               h={isCenter ? "64px" : "full"}
//               w={isCenter ? "64px" : "14"}
//               mt={isCenter ? "-36px" : "0"}
//               borderRadius={isCenter ? "full" : "none"}
//               border={isCenter ? "5px solid" : "none"}
//               borderColor={isCenter ? (colorMode === 'light' ? 'white' : 'gray.900') : "transparent"}
//               bgGradient={isCenter ? (colorMode === 'light' ? 'linear(to-br, brand.400, brand.600)' : 'linear(to-br, brand.500, brand.700)') : "none"}
//               color={
//                 isCenter
//                   ? "white"
//                   : (isActive ? (colorMode === 'light' ? 'brand.600' : 'brand.400') : (colorMode === 'light' ? 'gray.400' : 'gray.500'))
//               }
//               boxShadow={isCenter ? (colorMode === 'light' ? '0 10px 20px -5px var(--chakra-colors-brand-500)' : '0 10px 20px -5px rgba(0,0,0,0.8)') : "none"}
//               transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
//               _hover={{ textDecoration: 'none', transform: isCenter ? 'translateY(-2px)' : 'none' }}
//               _active={{ transform: 'scale(0.92)' }}
//               zIndex={isCenter ? 10 : 1}
//             >
//               {/* Active Indicator (Line at top) */}
//               {isActive && !isCenter && (
//                 <Box
//                   position="absolute"
//                   top="-1px"
//                   h="3px"
//                   w="28px"
//                   borderBottomRadius="md"
//                   bg={colorMode === 'light' ? 'brand.500' : 'brand.400'}
//                   boxShadow={colorMode === 'light' ? '0 2px 8px var(--chakra-colors-brand-200)' : '0 2px 8px var(--chakra-colors-brand-800)'}
//                 />
//               )}

//               {/* Icon */}
//               <Icon
//                 as={link.icon}
//                 boxSize={isCenter ? "26px" : "22px"}
//                 transition="all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
//                 transform={(!isCenter && isActive) ? 'scale(1.15) translateY(-2px)' : 'scale(1) translateY(0)'}
//                 mb={isCenter ? 0 : 1}
//               />

//               {/* Label */}
//               {!isCenter && (
//                 <Text
//                   fontSize="10px"
//                   fontWeight={isActive ? "700" : "500"}
//                   transition="all 0.3s"
//                   color={isActive ? (colorMode === 'light' ? 'brand.600' : 'brand.400') : (colorMode === 'light' ? 'gray.500' : 'gray.500')}
//                   lineHeight="1"
//                   noOfLines={1}
//                 >
//                   {link.label}
//                 </Text>
//               )}
//             </ChakraLink>
//           );
//         })}
//       </Flex>
//     </Box>
//   );
// });
