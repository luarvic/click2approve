import { Box } from "@mui/material";
import { observer } from "mobx-react-lite";
import { Navigate } from "react-router-dom";
import ArchiveGrid from "../../components/grids/ArchiveGrid";
import NavigationTabs from "../../components/tabs/NavigationTabs";
import { stores } from "../../stores/stores";

const ArchivePage = () => {
  return stores.userAccountStore.currentUser ? (
    <Box>
      <NavigationTabs />
      <Box sx={{ p: 2 }}>
        <ArchiveGrid />
      </Box>
    </Box>
  ) : (
    <Navigate to="/signIn" />
  );
};

export default observer(ArchivePage);
