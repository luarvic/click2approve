import { Box } from "@mui/material";
import { observer } from "mobx-react-lite";
import InboxGrid from "../../components/grids/InboxGrid";
import TabsNavBar from "../../components/navBars/TabsNavBar";
import { stores } from "../../stores/Stores";
import InformationPage from "../other/InformationPage";

const InboxPage = () => {
  return stores.userAccountStore.currentUser ? (
    <Box sx={{ display: "flex", pt: 2 }}>
      <TabsNavBar />
      <InboxGrid />
    </Box>
  ) : (
    <InformationPage message="Sign in to manage files." />
  );
};

export default observer(InboxPage);
