import { Box } from "@mui/material";
import { observer } from "mobx-react-lite";
import { Navigate } from "react-router-dom";
import InboxGrid from "../../components/grids/InboxGrid";
import NavigationTabs from "../../components/tabs/NavigationTabs";
import { stores } from "../../stores/stores";

const InboxPage = () => {
  return stores.userAccountStore.currentUser ? (
    <Box>
      <NavigationTabs />
      <Box sx={{ p: 2 }}>
        <InboxGrid />
      </Box>
    </Box>
  ) : (
    <Navigate to="/signIn" />
  );
};

export default observer(InboxPage);
