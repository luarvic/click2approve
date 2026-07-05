import { Outlet } from "react-router-dom";
import MainAppBar from "../components/appBars/MainAppBar";
import TenantCreateDialog from "../components/dialogs/TenantCreateDialog";
import UserSettingsDrawer from "../components/drawers/UserSettingsDrawer";

const MainLayout = () => {
  return (
    <>
      <MainAppBar />
      <UserSettingsDrawer />
      <TenantCreateDialog />
      <Outlet />
    </>
  );
};

export default MainLayout;
