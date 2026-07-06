import { Box, Toolbar } from "@mui/material";
import { observer } from "mobx-react-lite";
import { Outlet } from "react-router-dom";
import MainAppBar from "../components/appBars/MainAppBar";
import ApprovalRequestSubmitDialog from "../components/dialogs/ApprovalRequestSubmitDialog";
import TenantCreateDialog from "../components/dialogs/TenantCreateDialog";
import MainMenuDrawer from "../components/drawers/MainMenuDrawer";
import ProfileDrawer from "../components/drawers/ProfileDrawer";
import {
  APP_BAR_SPACER_SX,
  MAIN_CONTENT_SX,
} from "../data/constants";
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
        sx={MAIN_CONTENT_SX(drawerIsVisible)}
      >
        <Toolbar sx={APP_BAR_SPACER_SX} />
        <ProfileDrawer />
        <TenantCreateDialog />
        <ApprovalRequestSubmitDialog />
        <Outlet />
      </Box>
    </>
  );
};

export default observer(MainLayout);
