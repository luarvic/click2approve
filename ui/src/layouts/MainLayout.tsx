import { Outlet } from "react-router-dom";
import MainNavBar from "../components/navBars/MainNavBar";

const MainLayout = () => {
  return (
    <>
      <MainNavBar />
      <Outlet />
    </>
  );
};

export default MainLayout;
