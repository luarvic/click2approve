import { stores } from "@/app/rootStore";
import ApprovalRequestStepsDialog from "@/features/approvalRequests/components/ApprovalRequestStepsDialog";
import ApprovalRequestSubmitDialog from "@/features/approvalRequests/components/ApprovalRequestSubmitDialog";
import TenantCreateDialog from "@/features/tenants/components/TenantCreateDialog";
import MainAppBar from "@/shared/components/layout/MainAppBar";
import MainMenuDrawer from "@/shared/components/layout/MainMenuDrawer";
import ProfileDrawer from "@/shared/components/layout/ProfileDrawer";
import { Shell } from "@/shared/constants/constants";
import { Box, Toolbar } from "@mui/material";
import { observer } from "mobx-react-lite";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
  const drawerIsVisible =
    Boolean(stores.userAccountStore.currentUser) &&
    stores.commonStore.mainMenuDrawerIsOpen;

  return (
    <>
      <MainAppBar />
      <MainMenuDrawer />
      <Box component="main" sx={Shell.mainContentSx(drawerIsVisible)}>
        <Toolbar sx={Shell.appBarSpacerSx} />
        <ProfileDrawer />
        <TenantCreateDialog />
        <ApprovalRequestSubmitDialog />
        <ApprovalRequestStepsDialog />
        <Outlet />
      </Box>
    </>
  );
};

export default observer(MainLayout);
