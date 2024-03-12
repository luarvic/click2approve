import { Archive, AttachFile, Inbox, Send } from "@mui/icons-material";
import {
  Badge,
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import { Tab, commonStore } from "../stores/CommonStore";
import { approvalRequestStore } from "../stores/ApprovalRequestStore";
import { useEffect } from "react";

// Tabs (Files, Inbox, Archive, Sent).
const Tabs = () => {
  const { getCurrentTab } = commonStore;
  const { numberOfInboxApprovalRequests, loadNumberOfInboxApprovalRequests } =
    approvalRequestStore;
  const navigate = useNavigate();

  useEffect(() => {
    loadNumberOfInboxApprovalRequests();
  }, []);

  return (
    <Box sx={{ pr: 2 }}>
      <List disablePadding>
        <ListItemButton
          selected={getCurrentTab() === Tab.Files}
          onClick={() => {
            navigate("/files");
          }}
        >
          <ListItemIcon>
            <AttachFile />
          </ListItemIcon>
          <ListItemText primary="Files" />
        </ListItemButton>
        <ListItemButton
          selected={getCurrentTab() === Tab.Inbox}
          onClick={() => {
            navigate("/inbox");
          }}
        >
          <ListItemIcon>
            <Badge badgeContent={numberOfInboxApprovalRequests} color="error">
              <Inbox />
            </Badge>
          </ListItemIcon>
          <ListItemText primary="Inbox" />
        </ListItemButton>
        <ListItemButton
          selected={getCurrentTab() === Tab.Archive}
          onClick={() => {
            navigate("/archive");
          }}
        >
          <ListItemIcon>
            <Archive />
          </ListItemIcon>
          <ListItemText primary="Archive" />
        </ListItemButton>
        <ListItemButton
          selected={getCurrentTab() === Tab.Sent}
          onClick={() => {
            navigate("/sent");
          }}
        >
          <ListItemIcon>
            <Send />
          </ListItemIcon>
          <ListItemText primary="Sent" />
        </ListItemButton>
      </List>
    </Box>
  );
};

export default observer(Tabs);
