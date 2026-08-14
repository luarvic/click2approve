import { stores } from "@/app/rootStore";
import MainAppBar from "@/shared/components/layout/MainAppBar";
import MainMenuDrawer from "@/shared/components/layout/MainMenuDrawer";
import ProfileDrawer from "@/shared/components/layout/ProfileDrawer";
import { Shell } from "@/shared/constants/constants";
import { AppBarOptions } from "@/shared/models/appBarOptions";
import { Box, Container, Toolbar } from "@mui/material";
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

  return (
    <Box sx={Shell.outerBackgroundSx}>
      <Container maxWidth="xl" disableGutters sx={Shell.contentBackgroundSx}>
        <MainAppBar {...appBarOptions} />
        {showMainMenuButton && <MainMenuDrawer />}
        <Box component="main" sx={Shell.mainContentSx(drawerIsVisible)}>
          <Toolbar sx={Shell.appBarSpacerSx} />
          <ProfileDrawer />
          {children ?? <Outlet />}
        </Box>
      </Container>
    </Box>
  );
};

export default observer(MainLayout);
