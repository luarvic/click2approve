import { Box } from "@mui/material";
import {
  GridToolbarColumnsButton,
  GridToolbarDensitySelector,
  GridToolbarExport,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import { DISPLAY_DEPENDING_ON_SIZE } from "../../data/constants";

const GridToolbarButtons = () => {
  return (
    <Box sx={{ display: DISPLAY_DEPENDING_ON_SIZE }}>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
      <GridToolbarExport />
    </Box>
  );
};

export default GridToolbarButtons;
