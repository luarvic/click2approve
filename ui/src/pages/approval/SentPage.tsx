import { Box, Typography } from "@mui/material";
import { observer } from "mobx-react-lite";
import { Navigate } from "react-router-dom";
import SentGrid from "../../components/grids/SentGrid";
import { PAGE_CONTAINER_SX } from "../../data/constants";
import { stores } from "../../stores/stores";

const SentPage = () => {
  return stores.userAccountStore.currentUser ? (
    <Box sx={PAGE_CONTAINER_SX}>
      <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
        Outgoing
      </Typography>
      <SentGrid />
    </Box>
  ) : (
    <Navigate to="/signIn" />
  );
};

export default observer(SentPage);
