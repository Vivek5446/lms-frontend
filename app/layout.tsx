"use client";

import { observer } from "mobx-react-lite";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import { theme } from "./theme/theme";
import { lato } from "./theme/theme";
import "./globals.css";
import MainLayout from "./layouts/mainLayout/MainLayout";
import AuthenticationLayout from "./layouts/authenticationLayout/AuthenticationLayout";
import DashboardLayout from "./layouts/dashboardLayout/DashboardLayout";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import stores from "./store/stores";
import Notification from "./component/common/Notification/Notification";
import { Montserrat } from "next/font/google";
import { getMetadataForPath, PageMetadata } from "./metadata";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const RootLayout = observer(({ children }: { children: React.ReactNode }) => {
  const {
    companyStore: { getCompanyDetails },
    auth: { user },
  } = stores;
  const pathname = usePathname();
  const [metadata, setMetadata] = useState<PageMetadata>({
    title: "Vendor",
    description:
      "Vendor",
  });

  useEffect(() => {
    if (user) {
      getCompanyDetails();
    }
  }, [getCompanyDetails, user]);

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
      // // // console.log('RootLayout hydrated, body classes:', document.body.className);
    }
  }, []);

  const getLayout = () => {
    if (
      pathname === "/login" ||
      pathname === "/register" ||
      pathname === "/forgot-password"
    ) {
      return AuthenticationLayout;
    } else if (pathname?.startsWith("/dashboard")) {
      return DashboardLayout;
    }
    return MainLayout;
  };

  const LayoutComponent = getLayout();

  return (
    <html lang="en">
      <head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <meta
          property="og:image"
          content="https://www.Dentalhealth.com/images/logo.png"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="UTF-8" />
        <ColorModeScript initialColorMode="light" />
      </head>
      <body className={`${lato.className} ${montserrat.className}`}>
        <ChakraProvider theme={theme}>
          <Notification />
          <LayoutComponent>{children}</LayoutComponent>
        </ChakraProvider>
      </body>
    </html>
  );
});

export default RootLayout;