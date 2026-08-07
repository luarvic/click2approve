import { stores } from "@/app/rootStore";
import MainAppBar from "@/shared/components/layout/MainAppBar";
import MainMenuDrawer from "@/shared/components/layout/MainMenuDrawer";
import ProfileDrawer from "@/shared/components/layout/ProfileDrawer";
import { Shell } from "@/shared/constants/constants";
import { AppBarOptions } from "@/shared/models/appBarOptions";
import { Box, Toolbar } from "@mui/material";
import { observer } from "mobx-react-lite";
import { ReactNode } from "react";
import { Outlet } from "react-router-dom";

interface MainLayoutProps {
  appBarOptions?: AppBarOptions;
  children?: ReactNode;
}

const MainLayout = ({
  appBarOptions: configuredAppBarOptions,
  children,
}: MainLayoutProps) => {
  const appBarOptions =
    configuredAppBarOptions ?? stores.commonStore.appBarOptions ?? {};
  const showMainMenuButton = appBarOptions.showMainMenuButton ?? true;
  const drawerIsVisible =
    Boolean(stores.userAccountStore.currentUser) &&
    showMainMenuButton &&
    stores.commonStore.mainMenuDrawerIsOpen;

  return (
    <>
      <MainAppBar {...appBarOptions} />
      {showMainMenuButton && <MainMenuDrawer />}
      <Box component="main" sx={Shell.mainContentSx(drawerIsVisible)}>
        <Toolbar sx={Shell.appBarSpacerSx} />
        <ProfileDrawer />
        {children ?? <Outlet />}
      </Box>
    </>
  );
};

export default observer(MainLayout);
