import { Box } from "@mui/material";
import { observer } from "mobx-react-lite";
import { Navigate } from "react-router-dom";
import FilesGrid from "../../components/grids/FilesGrid";
import NavigationTabs from "../../components/tabs/NavigationTabs";
import { stores } from "../../stores/stores";

const FilesPage = () => {
  return stores.userAccountStore.currentUser ? (
    <Box>
      <NavigationTabs />
      <Box sx={{ p: 2 }}>
        <FilesGrid />
      </Box>
    </Box>
  ) : (
    <Navigate to="/signIn" />
  );
};

export default observer(FilesPage);
