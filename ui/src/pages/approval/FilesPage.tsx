import { Box } from "@mui/material";
import { observer } from "mobx-react-lite";
import { Navigate } from "react-router-dom";
import FilesGrid from "../../components/grids/FilesGrid";
import TabsNavBar from "../../components/navBars/TabsNavBar";
import { stores } from "../../stores/stores";

const FilesPage = () => {
  return stores.userAccountStore.currentUser ? (
    <Box sx={{ display: "flex", pt: 2 }}>
      <TabsNavBar />
      <FilesGrid />
    </Box>
  ) : (
    <Navigate to="/signIn" />
  );
};

export default observer(FilesPage);
