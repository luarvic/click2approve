import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import { PAGE_CONTAINER_SX } from "../data/constants";

const WrapperLayout = () => {
  return (
    <Box sx={PAGE_CONTAINER_SX}>
      <Outlet />
    </Box>
  );
};

export default WrapperLayout;
