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
import { Tab } from "../../models/tab";
import { commonStore } from "../../stores/commonStore";
import { taskStore } from "../../stores/taskStore";

const TabsNavBar = () => {
  const { currentTab, setCurrentTab } = commonStore;

  const { numberOfUncompletedTasks, loadNumberOfUncompletedTasks } = taskStore;
  const navigate = useNavigate();

  useEffect(() => {
    loadNumberOfUncompletedTasks();
  }, []);

  const handleTabChange = (tab: Tab) => {
    loadNumberOfUncompletedTasks();
    if (currentTab !== tab) {
      setCurrentTab(tab);
      switch (tab) {
        case Tab.Files:
          navigate("/files");
          break;
        case Tab.Inbox:
          navigate("/inbox");
          break;
        case Tab.Archive:
          navigate("/archive");
          break;
        case Tab.Sent:
          navigate("/sent");
          break;
      }
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
            <Badge badgeContent={numberOfUncompletedTasks} color="error">
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

export default observer(TabsNavBar);
