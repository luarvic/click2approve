import { Box } from "@mui/material";
import ApprovalRequestsGrid from "../components/grids/ApprovalRequestsGrid";
import TabsNavBar from "../components/navBars/TabsNavBar";

const SentPage = () => {
  return (
    <Box sx={{ display: "flex", pt: 2 }}>
      <TabsNavBar />
      <ApprovalRequestsGrid />
    </Box>
  );
};

export default SentPage;
