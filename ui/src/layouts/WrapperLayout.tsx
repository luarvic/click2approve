import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";

const WrapperLayout = () => {
  return (
    <Box sx={{ p: 2 }}>
      <Outlet />
    </Box>
  );
};

export default WrapperLayout;
