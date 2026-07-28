import PublicAppBar from "@/shared/components/layout/PublicAppBar";
import { Shell } from "@/shared/constants/constants";
import { Box, Toolbar } from "@mui/material";
import { Outlet } from "react-router-dom";

const PublicLayout = () => {
  return (
    <>
      <PublicAppBar showBrandTitle brandTitleIsAlwaysVisible />
      <Box component="main">
        <Toolbar sx={Shell.appBarSpacerSx} />
        <Outlet />
      </Box>
    </>
  );
};

export default PublicLayout;
