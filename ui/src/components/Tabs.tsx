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
import { Tab } from "../models/Tab";
import { approvalRequestStore } from "../stores/ApprovalRequestStore";
import { commonStore } from "../stores/CommonStore";
import { userFileStore } from "../stores/UserFileStore";

// Tabs (Files, Inbox, Archive, Sent).
const Tabs = () => {
  const { currentTab, setCurrentTab } = commonStore;
  const { clearUserFiles, loadUserFiles } = userFileStore;
  const {
    numberOfInboxApprovalRequests,
    clearApprovalRequests,
    loadApprovalRequests,
    loadNumberOfInboxApprovalRequests,
  } = approvalRequestStore;
  const navigate = useNavigate();

  useEffect(() => {
    loadNumberOfInboxApprovalRequests();
    handleTabChange(currentTab);
  }, []);

  const handleTabChange = (tab: Tab) => {
    setCurrentTab(tab);
    if (tab === Tab.Files) {
      clearUserFiles();
      loadUserFiles();
      navigate("/files");
    } else {
      clearApprovalRequests();
      loadApprovalRequests(tab);
      navigate(`/${Tab[tab].toLowerCase()}`);
    }
  };

  return (
    <Box sx={{ pr: 2 }}>
      <List disablePadding>
        <ListItemButton
          selected={currentTab === Tab.Files}
          onClick={() => {
            handleTabChange(Tab.Files);
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
            handleTabChange(Tab.Inbox);
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
            handleTabChange(Tab.Archive);
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
            handleTabChange(Tab.Sent);
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
