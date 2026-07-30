import { Pages } from "@/shared/constants/constants";
import { Box } from "@mui/material";
import { ReactNode } from "react";
import { Outlet } from "react-router-dom";

interface WrapperLayoutProps {
  children?: ReactNode;
}

const WrapperLayout = ({ children }: WrapperLayoutProps) => {
  return (
    <Box sx={Pages.containerSx}>
      {children ?? <Outlet />}
    </Box>
  );
};

export default WrapperLayout;
