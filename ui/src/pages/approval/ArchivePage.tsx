import { Backdrop, Box, CircularProgress } from "@mui/material";
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
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.modal + 1 }}
        open={stores.commonStore.isLoading("common")}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Box>
  ) : (
    <Navigate to="/signIn" />
  );
};

export default observer(ArchivePage);
