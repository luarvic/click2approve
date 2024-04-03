import { Box } from "@mui/material";
import { observer } from "mobx-react-lite";
import { Navigate } from "react-router-dom";
import ArchiveGrid from "../../components/grids/ArchiveGrid";
import TabsNavBar from "../../components/navBars/TabsNavBar";
import { stores } from "../../stores/Stores";

const ArchivePage = () => {
  return stores.userAccountStore.currentUser ? (
    <Box sx={{ display: "flex", pt: 2 }}>
      <TabsNavBar />
      <ArchiveGrid />
    </Box>
  ) : (
    <Navigate to="/signIn" />
  );
};

export default observer(ArchivePage);
