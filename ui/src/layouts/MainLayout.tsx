import { Alert, Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import MainAppBar from "../components/appBars/MainAppBar";
import UserSettingsDrawer from "../components/drawers/UserSettingsDrawer";

const MainLayout = () => {
  return (
    <>
      <MainAppBar />
      <Box sx={{ px: 2, pb: 1 }}>
        <Alert severity="warning" variant="filled" sx={{ borderRadius: 1 }}>
          <strong>This demo version retires October 1, 2026.</strong> It was intended for testing only, not production
          use. All data will be permanently lost and will not be migrated—download anything you need before then. The
          replacement will be production-ready, and you will need to create a new account.
        </Alert>
      </Box>
      <UserSettingsDrawer />
      <Outlet />
    </>
  );
};

export default MainLayout;
