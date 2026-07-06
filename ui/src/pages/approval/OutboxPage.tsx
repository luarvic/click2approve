import { Box, Typography } from "@mui/material";
import { observer } from "mobx-react-lite";
import { Navigate } from "react-router-dom";
import OutboxGrid from "../../components/grids/OutboxGrid";
import { PAGE_CONTAINER_SX, PAGE_TITLE_SX } from "../../data/constants";
import { stores } from "../../stores/stores";

const OutboxPage = () => {
  return stores.userAccountStore.currentUser ? (
    <Box sx={PAGE_CONTAINER_SX}>
      <Typography component="h1" variant="h5" sx={PAGE_TITLE_SX}>
        Outgoing Requests
      </Typography>
      <OutboxGrid />
    </Box>
  ) : (
    <Navigate to="/signIn" />
  );
};

export default observer(OutboxPage);
