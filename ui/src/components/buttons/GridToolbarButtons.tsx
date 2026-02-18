import { Box } from "@mui/material";
import {
  GridToolbarExport,
  GridToolbarFilterButton
} from "@mui/x-data-grid";
import { DISPLAY_DEPENDING_ON_SIZE } from "../../data/constants";

const GridToolbarButtons = () => {
  return (
    <Box sx={{ display: DISPLAY_DEPENDING_ON_SIZE }}>
      <GridToolbarFilterButton />
      <GridToolbarExport />
    </Box>
  );
};

export default GridToolbarButtons;
