import { Outlet } from "react-router-dom";
import MainAppBar from "../components/appBars/MainAppBar";
import UserSettingsDrawer from "../components/drawers/UserSettingsDrawer";

const MainLayout = () => {
  return (
    <>
      <MainAppBar />
      <UserSettingsDrawer />
      <Outlet />
    </>
  );
};

export default MainLayout;
