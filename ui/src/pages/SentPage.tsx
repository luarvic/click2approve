import { Box } from "@mui/material";
import SentGrid from "../components/grids/SentGrid";
import TabsNavBar from "../components/navBars/TabsNavBar";

const SentPage = () => {
  return (
    <Box sx={{ display: "flex", pt: 2 }}>
      <TabsNavBar />
      <SentGrid />
    </Box>
  );
};

export default SentPage;
