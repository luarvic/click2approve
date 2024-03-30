import { Box } from "@mui/material";
import TabsNavBar from "../components/navBars/TabsNavBar";
import FilesGrid from "../components/grids/FilesGrid";

const FilesPage = () => {
  return (
    <Box sx={{ display: "flex", pt: 2 }}>
      <TabsNavBar />
      <FilesGrid />
    </Box>
  );
};

export default FilesPage;
