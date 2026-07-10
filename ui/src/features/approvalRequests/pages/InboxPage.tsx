import { stores } from "@/app/rootStore";
import InboxGrid from "@/features/approvalRequests/components/InboxGrid";
import { Pages } from "@/shared/constants/constants";
import { Box, Typography } from "@mui/material";
import { observer } from "mobx-react-lite";
import { Navigate } from "react-router-dom";

const InboxPage = () => {
  return stores.userAccountStore.currentUser ? (
    <Box sx={Pages.containerSx}>
      <Typography component="h1" variant="h5" sx={Pages.titleSx}>
        Incoming Requests
      </Typography>
      <InboxGrid />
    </Box>
  ) : (
    <Navigate to="/signIn" />
  );
};

export default observer(InboxPage);
