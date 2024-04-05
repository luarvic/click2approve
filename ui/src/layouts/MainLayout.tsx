import { Outlet } from "react-router-dom";
import UserSettingsDrawer from "../components/drawers/UserSettingsDrawer";
import MainNavBar from "../components/navBars/MainNavBar";

const MainLayout = () => {
  return (
    <>
      <MainNavBar />
      <UserSettingsDrawer />
      <Outlet />
    </>
  );
};

export default MainLayout;
