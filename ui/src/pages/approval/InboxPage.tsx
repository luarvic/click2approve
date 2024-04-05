import { Box } from "@mui/material";
import { observer } from "mobx-react-lite";
import { Navigate } from "react-router-dom";
import InboxGrid from "../../components/grids/InboxGrid";
import TabsNavBar from "../../components/navBars/TabsNavBar";
import { stores } from "../../stores/stores";

const InboxPage = () => {
  return stores.userAccountStore.currentUser ? (
    <Box sx={{ display: "flex", pt: 2 }}>
      <TabsNavBar />
      <InboxGrid />
    </Box>
  ) : (
    <Navigate to="/signIn" />
  );
};

export default observer(InboxPage);
