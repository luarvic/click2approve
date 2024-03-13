import { Archive, Inbox, InsertDriveFile, Send } from "@mui/icons-material";
import {
  Badge,
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { approvalRequestStore } from "../stores/ApprovalRequestStore";
import { Tab, commonStore } from "../stores/CommonStore";

// Tabs (Files, Inbox, Archive, Sent).
const Tabs = () => {
  const { currentTab } = commonStore;
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
          selected={currentTab === Tab.Files}
          onClick={() => {
            navigate("/files");
          }}
        >
          <ListItemIcon>
            <InsertDriveFile />
          </ListItemIcon>
          <ListItemText primary="Files" />
        </ListItemButton>
        <ListItemButton
          selected={currentTab === Tab.Inbox}
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
          selected={currentTab === Tab.Archive}
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
          selected={currentTab === Tab.Sent}
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
