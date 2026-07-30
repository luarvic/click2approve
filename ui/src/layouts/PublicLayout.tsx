import PublicAppBar from "@/shared/components/layout/PublicAppBar";
import { Shell } from "@/shared/constants/constants";
import { Box, Toolbar } from "@mui/material";
import { ReactNode } from "react";
import { Outlet } from "react-router-dom";

interface PublicLayoutProps {
  children?: ReactNode;
}

const PublicLayout = ({ children }: PublicLayoutProps) => {
  return (
    <>
      <PublicAppBar showBrandTitle brandTitleIsAlwaysVisible />
      <Box component="main">
        <Toolbar sx={Shell.appBarSpacerSx} />
        {children ?? <Outlet />}
      </Box>
    </>
  );
};

export default PublicLayout;
