'use client';

import { useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Box, Spinner, useBreakpointValue, useMediaQuery, useTheme } from '@chakra-ui/react';
import styled from 'styled-components';
import stores from '../../store/stores';
// import { authenticastion } from '../../config/utils/routes';
import SidebarLayout from './SidebarLayout/SidebarLayout';
import HeaderLayout from './HeaderLayout/HeaderLayout';
// import PermissionDeniedPage from '../../component/common/Loader/PermissionDeniedPage';
import { contentLargeBodyPadding, contentSmallBodyPadding, headerHeight, mediumSidebarWidth } from '../../component/config/utils/variable';
import ThemeChangeContainer from '../../component/common/ThemeChangeContainer/ThemeChangeContainer';
import PageLoader from '../../component/common/Loader/PageLoader';


const DashboardLayout = observer(({ children }: { children: React.ReactNode }) => {
  const {
    auth: { user },
    dashboardStore : {getMasterData},
    layout: { fullScreenMode, mediumScreenMode, isCallapse, openDashSidebarFun, openMobileSideDrawer, setOpenMobileSideDrawer },
    themeStore: { themeConfig },
  } = stores;
  const theme = useTheme();
  const [hasMounted, setHasMounted] = useState(false);

  const [sizeStatus] = useMediaQuery(`(max-width: ${theme.breakpoints.xl})`);
  const isMobile = useBreakpointValue({ base: true, lg: false }) ?? false;
  const sidebarRef = useRef<HTMLDivElement | null>(null);

  const closeDrawerModel = () => {
    setOpenMobileSideDrawer(false);
  };

  const handleSidebarItemClick = (item: any) => {
    if (!item.children || item.url) {
      localStorage.setItem('activeComponentName', item.id);
    }
  };

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        openDashSidebarFun(true);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCallapse, openDashSidebarFun]);

  useEffect(() => {
    if(user){
    getMasterData()
    }
  },[user , getMasterData])

  if (!hasMounted) {
    return (
      <PageLoader loading={true}>
        <Spinner />
      </PageLoader>
    );
  }

  return user ? (
    <Box
    >
      <MainContainer $isMobile={isMobile}>
        <Box ref={sidebarRef}>
          <SidebarLayout
            onItemClick={handleSidebarItemClick}
            isCollapsed={isCallapse}
            onLeafItemClick={handleSidebarItemClick}
            openMobileSideDrawer={openMobileSideDrawer}
            setOpenMobileSideDrawer={closeDrawerModel}
          />
        </Box>
        <Container>
          <HeaderContainer
            $isMobile={isMobile}
            $backgroundColor={themeConfig.colors.custom.light.primary}
          >
            <HeaderLayout />
          </HeaderContainer>
          <ContentContainer
            $isMobile={isMobile}
            className={
              fullScreenMode ? 'fullscreen' : mediumScreenMode ? 'mediumScreen' : ''
            }
          >
            {children}
          </ContentContainer>
        </Container>
      </MainContainer>
      <ThemeChangeContainer />
    </Box>
  ) : (
    <PageLoader loading={true}>
    <Spinner />
    </PageLoader>
    // <RedirectComponent />
  );
});

export default DashboardLayout;

const MainContainer = styled.div<{ $isMobile: boolean }>`
  display: flex;
  transition: all 0.3s ease-in-out;
  overflow: hidden;
  margin-left: ${(props) => (props.$isMobile ? '0px' : mediumSidebarWidth)};
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease-in-out;
`;

const HeaderContainer = styled.div<{
  $backgroundColor: string;
  $isMobile: boolean;
}>`
  z-index: 99;
  height: ${headerHeight};
  position: fixed;
  top: 0;
  right: 0;
  background-color: ${(props) => props.$backgroundColor};
  left: ${(props) => (props.$isMobile ? '0px' : mediumSidebarWidth)};
  transition: all 0.3s ease-in-out;
`;

const ContentContainer = styled.div<{ $isMobile: boolean }>`
  padding: ${({ $isMobile }) =>
    $isMobile ? `${contentSmallBodyPadding}` : `${contentLargeBodyPadding}`};
  width: ${({ $isMobile }) =>
    $isMobile ? '100vw' : `calc(100vw - ${mediumSidebarWidth})`};
  overflow-x: hidden;
  height: calc(100vh - ${headerHeight});
  transition: all 0.3s ease-in-out;
  margin-top: ${headerHeight};
`;
