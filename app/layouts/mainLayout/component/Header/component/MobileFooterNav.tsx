'use client';

import { PERMISSION_KEYS, hasAnyCourseViewPermission, hasPermission } from '@/app/config/utils/permissions';
import { isLearnerRole, isManagerRole } from '@/app/config/utils/roleAccess';
import stores from '@/app/store/stores';
import { Box, useColorMode } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { Compass, Home, SlidersHorizontal, User } from 'lucide-react';
import { observer } from 'mobx-react-lite';
import { usePathname, useRouter } from 'next/navigation';

interface MobileFooterNavProps {
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

const spring = { type: 'spring' as const, stiffness: 320, damping: 28 };

export const MobileFooterNav = observer(({ mobileMenuOpen, onToggleMobileMenu }: MobileFooterNavProps) => {
  const { colorMode } = useColorMode();
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

  const navItems = [
    { key: 'home', label: 'Home', icon: Home, href: '/' },
    { key: 'courses', label: 'Courses', icon: Compass, href: '/course' },
    // { key: 'learning', label: isLearner ? 'Learning' : 'Dashboard', icon: GraduationCap, href: isLoggedIn ? appHref : '/login' },
    { key: 'profile', label: 'Profile', icon: User, href: isLoggedIn ? '/user-profile' : '/login' },
    { key: 'more', label: 'More', icon: SlidersHorizontal, isDrawer: true },
  ];

  const getActiveKey = () => {
    if (mobileMenuOpen) return 'more';
    if (pathname === '/user-profile') return 'profile';
    if (pathname === '/' || pathname === '') return 'home';
    if (pathname.startsWith('/course')) return 'courses';
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/batches') || pathname.startsWith('/manager')) return 'learning';
    return '';
  };

  const activeKey = getActiveKey();
  const isDark = colorMode === 'dark';

  return (
    <Box
      display={{ base: 'block', md: 'none' }}
      position="fixed"
      left="0"
      right="0"
      bottom="0"
      zIndex="1000"
      px={4}
      pb="calc(12px + env(safe-area-inset-bottom, 0px))"
      pt={2}
      pointerEvents="none"
    >
      <nav
        className={`pointer-events-auto relative flex w-full max-w-md items-center justify-between mx-auto rounded-full p-1.5 backdrop-blur-xl transition-colors duration-300 ${
          isDark
            ? 'bg-slate-900/90 ring-1 ring-slate-800 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)]'
            : 'bg-white/90 ring-1 ring-slate-200/80 shadow-[0_10px_40px_-10px_rgba(15,23,42,0.18)]'
        }`}
      >
        {navItems.map((item) => {
          const isActive = activeKey === item.key;

          const handleClick = () => {
            if (item.isDrawer) {
              onToggleMobileMenu();
            } else {
              if (mobileMenuOpen) {
                onToggleMobileMenu();
              }
              if (item.href) {
                router.push(item.href);
              }
            }
          };

          return (
            <motion.button
              key={item.key}
              whileTap={{ scale: 0.93 }}
              onClick={handleClick}
              className="relative flex flex-1 flex-col items-center justify-center py-2 min-h-[48px] select-none"
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-pill"
                  transition={spring}
                  className="absolute inset-1 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 shadow-md shadow-blue-500/30"
                />
              )}
              <span
                className={`relative z-10 flex flex-col items-center gap-0.5 transition-colors duration-200 ${
                  isActive
                    ? 'text-white font-bold'
                    : isDark
                      ? 'text-slate-400 hover:text-slate-200'
                      : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <item.icon className="h-5 w-5 stroke-[2.2]" />
                <span className="text-[10.5px] font-semibold leading-none">{item.label}</span>
              </span>
            </motion.button>
          );
        })}
      </nav>
    </Box>
  );
});

