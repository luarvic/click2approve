import { Box } from "@mui/material";
import { observer } from "mobx-react-lite";
import { Navigate } from "react-router-dom";
import ArchiveGrid from "../../components/grids/ArchiveGrid";
import TabsList from "../../components/lists/TabsList";
import { stores } from "../../stores/stores";

const ArchivePage = () => {
  return stores.userAccountStore.currentUser ? (
    <Box sx={{ display: "flex", pt: 2 }}>
      <TabsList />
      <ArchiveGrid />
    </Box>
  ) : (
    <Navigate to="/signIn" />
  );
};

export default observer(ArchivePage);
