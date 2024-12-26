import { Box } from "@mui/material";
import { observer } from "mobx-react-lite";
import { Navigate } from "react-router-dom";
import SentGrid from "../../components/grids/SentGrid";
import NavigationTabs from "../../components/tabs/NavigationTabs";
import { stores } from "../../stores/stores";

const SentPage = () => {
  return stores.userAccountStore.currentUser ? (
    <Box>
      <NavigationTabs />
      <Box sx={{ p: 2 }}>
        <SentGrid />
      </Box>
    </Box>
  ) : (
    <Navigate to="/signIn" />
  );
};

export default observer(SentPage);
