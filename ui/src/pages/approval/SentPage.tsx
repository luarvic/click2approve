import { Box } from "@mui/material";
import { observer } from "mobx-react-lite";
import { Navigate } from "react-router-dom";
import SentGrid from "../../components/grids/SentGrid";
import TabsNavBar from "../../components/navBars/TabsNavBar";
import { stores } from "../../stores/stores";

const SentPage = () => {
  return stores.userAccountStore.currentUser ? (
    <Box sx={{ display: "flex", pt: 2 }}>
      <TabsNavBar />
      <SentGrid />
    </Box>
  ) : (
    <Navigate to="/signIn" />
  );
};

export default observer(SentPage);
