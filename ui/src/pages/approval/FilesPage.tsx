import { Box } from "@mui/material";
import { observer } from "mobx-react-lite";
import { Navigate } from "react-router-dom";
import FilesGrid from "../../components/grids/FilesGrid";
import TabsList from "../../components/lists/TabsList";
import { stores } from "../../stores/stores";

const FilesPage = () => {
  return stores.userAccountStore.currentUser ? (
    <Box sx={{ display: "flex", pt: 2 }}>
      <TabsList />
      <FilesGrid />
    </Box>
  ) : (
    <Navigate to="/signIn" />
  );
};

export default observer(FilesPage);
