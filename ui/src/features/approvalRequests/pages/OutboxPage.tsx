import { stores } from "@/app/rootStore";
import OutboxGrid from "@/features/approvalRequests/components/OutboxGrid";
import { Pages } from "@/shared/constants/constants";
import { Box, Typography } from "@mui/material";
import { observer } from "mobx-react-lite";
import { Navigate } from "react-router-dom";

const OutboxPage = () => {
  return stores.userAccountStore.currentUser ? (
    <Box sx={Pages.containerSx}>
      <Typography component="h1" variant="h5" sx={Pages.titleSx}>
        Outgoing Requests
      </Typography>
      <OutboxGrid />
    </Box>
  ) : (
    <Navigate to="/signIn" />
  );
};

export default observer(OutboxPage);
