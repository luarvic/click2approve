import { Pages } from "@/shared/constants/constants";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";

const WrapperLayout = () => {
  return (
    <Box sx={Pages.containerSx}>
      <Outlet />
    </Box>
  );
};

export default WrapperLayout;
