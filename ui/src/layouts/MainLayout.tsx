import { stores } from "@/app/rootStore";
import MainAppBar from "@/shared/components/layout/MainAppBar";
import MainMenuDrawer from "@/shared/components/layout/MainMenuDrawer";
import ProfileDrawer from "@/shared/components/layout/ProfileDrawer";
import { Shell } from "@/shared/components/layout/shellStyles";
import SiteFooter from "@/shared/components/layout/SiteFooter";
import UserGuide from "@/shared/components/onboarding/UserGuide";
import { AppBarOptions } from "@/shared/models/appBarOptions";
import { GlobalLoadingActionLoaderScopes } from "@/shared/utils/actionLoaders";
import { Box, Container, LinearProgress, Toolbar } from "@mui/material";
import { observer } from "mobx-react-lite";
import { ReactNode } from "react";
import { Outlet } from "react-router-dom";

interface MainLayoutProps {
  appBarOptions?: AppBarOptions;
  children?: ReactNode;
}

const MainLayout = ({ appBarOptions: configuredAppBarOptions, children }: MainLayoutProps) => {
  const appBarOptions = configuredAppBarOptions ?? stores.commonStore.appBarOptions ?? {};
  const showMainMenuButton = appBarOptions.showMainMenuButton ?? true;
  const drawerIsVisible =
    Boolean(stores.userAccountStore.currentUser) && showMainMenuButton && stores.commonStore.mainMenuDrawerIsOpen;
  const isLoading = stores.commonStore.isAnyActionLoading(GlobalLoadingActionLoaderScopes);

  return (
    <Box sx={Shell.outerBackgroundSx}>
      <Container maxWidth="xl" disableGutters sx={Shell.contentBackgroundSx}>
        <MainAppBar {...appBarOptions} />
        <UserGuide appBarOptions={appBarOptions} />
        {showMainMenuButton && <MainMenuDrawer />}
        <Box sx={Shell.mainContentSx(drawerIsVisible)}>
          <Box component="main" sx={Shell.pageBodySx}>
            <Toolbar sx={Shell.appBarSpacerSx} />
            {isLoading && <LinearProgress sx={Shell.loadingProgressSx} />}
            <ProfileDrawer />
            {children ?? <Outlet />}
          </Box>
          <SiteFooter />
        </Box>
      </Container>
    </Box>
  );
};

export default observer(MainLayout);
