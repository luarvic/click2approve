import { Box } from "@mui/material";
import ArchiveGrid from "../components/grids/ArchiveGrid";
import TabsNavBar from "../components/navBars/TabsNavBar";

const ArchivePage = () => {
  return (
    <Box sx={{ display: "flex", pt: 2 }}>
      <TabsNavBar />
      <ArchiveGrid />
    </Box>
  );
};

export default ArchivePage;
