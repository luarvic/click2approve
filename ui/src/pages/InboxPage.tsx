import { Box } from "@mui/material";
import InboxGrid from "../components/grids/InboxGrid";
import TabsNavBar from "../components/navBars/TabsNavBar";

const InboxPage = () => {
  return (
    <Box sx={{ display: "flex", pt: 2 }}>
      <TabsNavBar />
      <InboxGrid />
    </Box>
  );
};

export default InboxPage;
