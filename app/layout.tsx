"use client";

import { observer } from "mobx-react-lite";
import { ChakraProvider, ColorModeScript, useColorMode } from "@chakra-ui/react";
import {
  buildAppTheme,
  learnerBodyFont,
  learnerHeadingFont,
  shouldUseCompanyDashboardBranding,
} from "./theme/theme";
import "./globals.css";
import MainLayout from "./layouts/mainLayout/MainLayout";
import AuthenticationLayout from "./layouts/authenticationLayout/AuthenticationLayout";
import DashboardLayout from "./layouts/dashboardLayout/DashboardLayout";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import stores from "./store/stores";
import Notification from "./component/common/Notification/Notification";
import { getMetadataForPath, PageMetadata } from "./metadata";

const RootLayout = observer(({ children }: { children: React.ReactNode }) => {
  const {
    companyStore: { getCompanyDetails },
    auth: { user, company },
    themeStore: { themeConfig },
  } = stores;
  const pathname = usePathname();
  const [metadata, setMetadata] = useState<PageMetadata>({
    title: "SkillShift",
    description:
      "SkillShift Learning Management System",
  });

  useEffect(() => {
    if (user && company) {
      getCompanyDetails();
    }
  }, [company, getCompanyDetails, user]);

  useEffect(() => {
    if (pathname) {
      const pageMetadata = getMetadataForPath(pathname);
      setMetadata(pageMetadata);
      if (typeof window !== "undefined") {
        document.title = pageMetadata.title;
      }
    }
  }, [pathname]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Removed viewport-fit=cover logic since we are relying on standard Android StatusBar

      // Fallback/Enhancement: Use Capacitor SafeArea plugin to inject CSS variables directly
      import('capacitor-plugin-safe-area').then(({ SafeArea }) => {
        SafeArea.getSafeAreaInsets().then(({ insets }) => {
          document.documentElement.style.setProperty('--safe-area-top', `${insets.top}px`);
          document.documentElement.style.setProperty('--safe-area-bottom', `${insets.bottom}px`);
        }).catch(() => {}); // ignore if not in capacitor

        SafeArea.addListener('safeAreaChanged', data => {
          document.documentElement.style.setProperty('--safe-area-top', `${data.insets.top}px`);
          document.documentElement.style.setProperty('--safe-area-bottom', `${data.insets.bottom}px`);
        });
      }).catch(() => {});
    }
  }, []);

  const getLayout = () => {
    if (
      pathname?.startsWith("/login") ||
      pathname?.startsWith("/register") ||
      pathname?.startsWith("/forgot-password")
    ) {
      return AuthenticationLayout;
    } else if (pathname?.startsWith("/dashboard")) {
      return DashboardLayout;
    }
    return MainLayout;
  };

  const LayoutComponent = getLayout();
  const isDashboardPath = pathname?.startsWith("/dashboard");
  const isLearnerThemeEnabled = !isDashboardPath;
  const isDashboardThemeEnabled = isDashboardPath && shouldUseCompanyDashboardBranding(user);
  const themeConfigSnapshot = isLearnerThemeEnabled
    ? "{}"
    : JSON.stringify(themeConfig || {});

  const isCreatedByAdmin = Boolean(user?.createdBy);
  const activeLearnerPrimaryColor = isCreatedByAdmin ? user?.companyDetails?.primaryThemeColor : undefined;

  const activeTheme = useMemo(
    () =>
      buildAppTheme({
        enableLearnerBranding: isLearnerThemeEnabled,
        enableDashboardBranding: isDashboardThemeEnabled,
        learnerPrimaryColor: activeLearnerPrimaryColor,
        dashboardPrimaryColor: user?.companyDetails?.primaryThemeColor,
        themeConfig: isLearnerThemeEnabled ? {} : JSON.parse(themeConfigSnapshot),
      }),
    [
      isLearnerThemeEnabled,
      isDashboardThemeEnabled,
      themeConfigSnapshot,
      activeLearnerPrimaryColor,
      user?.companyDetails?.primaryThemeColor,
    ]
  );

  return (
    <html lang="en">
      <head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <meta
          property="og:image"
          content="/logo.png"
        />
        <meta name="theme-color" content="#171923" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="UTF-8" />
        <ColorModeScript initialColorMode="light" />
      </head>
      <body className={`${learnerBodyFont.variable} ${learnerHeadingFont.variable} antialiased`}>
        <ChakraProvider theme={activeTheme}>
          <NavigationBarManager />
          <Notification />
          <Suspense fallback={null}>
             <LayoutComponent>{children}</LayoutComponent>
          </Suspense>
        </ChakraProvider>
      </body>
    </html>
  );
});

import { Box } from '@chakra-ui/react';

const MobileStatusBar = () => {
  const { colorMode } = useColorMode();
  return (
    <Box
      display={{ base: 'block', md: 'none' }}
      position="fixed"
      top={0}
      left={0}
      right={0}
      height="40px"
      bg={colorMode === 'light' ? '#FFFFFF' : '#171923'}
      zIndex={900}
      pointerEvents="none"
    />
  );
};

const NavigationBarManager = () => {
  const { colorMode } = useColorMode();

  useEffect(() => {
    // 1. Navigation Bar (Bottom)
    import('@capawesome/capacitor-navigation-bar').then(({ NavigationBar }) => {
      const navColor = colorMode === 'light' ? '#FFFFFF' : '#0A0F1E';
      NavigationBar.setColor({ color: navColor }).catch(() => {});
      NavigationBar.setStyle({ style: colorMode === 'light' ? 'LIGHT' : 'DARK' as any }).catch(() => {});
    }).catch(() => {});

    // 2. Status Bar (Top)
    import('@capacitor/status-bar').then(({ StatusBar, Style }) => {
      StatusBar.setOverlaysWebView({ overlay: true }).catch(() => {});
      StatusBar.setStyle({ style: colorMode === 'light' ? Style.Light : Style.Dark }).catch(() => {});
    }).catch(() => {});
  }, [colorMode]);

  return <MobileStatusBar />;
};

export default RootLayout;
