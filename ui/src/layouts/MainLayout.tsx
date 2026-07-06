import { Box, Toolbar } from "@mui/material";
import { observer } from "mobx-react-lite";
import { Outlet } from "react-router-dom";
import MainAppBar from "../components/appBars/MainAppBar";
import TenantCreateDialog from "../components/dialogs/TenantCreateDialog";
import MainMenuDrawer, {
  MAIN_MENU_DRAWER_WIDTH,
} from "../components/drawers/MainMenuDrawer";
import ProfileDrawer from "../components/drawers/ProfileDrawer";
import { stores } from "../stores/stores";

const MainLayout = () => {
  const drawerIsVisible =
    Boolean(stores.userAccountStore.currentUser) &&
    stores.commonStore.mainMenuDrawerIsOpen;

  return (
    <>
      <MainAppBar />
      <MainMenuDrawer />
      <Box
        component="main"
        sx={{
          ml: drawerIsVisible ? { md: `${MAIN_MENU_DRAWER_WIDTH}px` } : 0,
          transition: (theme) =>
            theme.transitions.create("margin", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
        }}
      >
        <Toolbar sx={{ minHeight: 64 }} />
        <ProfileDrawer />
        <TenantCreateDialog />
        <Outlet />
      </Box>
    </>
  );
};

export default observer(MainLayout);
