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
import { stores } from "../../stores/Stores";
import {
  LIST_ITEM_ICON_SX,
  LIST_ITEM_TEXT_SX,
} from "../../stores/constantsStore";

const TabsNavBar = () => {
  const navigate = useNavigate();

  useEffect(() => {
    stores.taskStore.loadNumberOfUncompletedTasks();
  }, []);

  const handleTabChange = (tab: Tab) => {
    stores.taskStore.loadNumberOfUncompletedTasks();
    if (stores.commonStore.currentTab !== tab) {
      stores.commonStore.setCurrentTab(tab);
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
          key="Files"
          selected={stores.commonStore.currentTab === Tab.Files}
          onClick={() => {
            handleTabChange(Tab.Files);
          }}
        >
          <ListItemIcon sx={LIST_ITEM_ICON_SX}>
            <InsertDriveFile />
          </ListItemIcon>
          <ListItemText primary="Files" sx={LIST_ITEM_TEXT_SX} />
        </ListItemButton>
        <ListItemButton
          key="Inbox"
          selected={stores.commonStore.currentTab === Tab.Inbox}
          onClick={() => {
            handleTabChange(Tab.Inbox);
          }}
        >
          <ListItemIcon sx={LIST_ITEM_ICON_SX}>
            <Badge
              badgeContent={stores.taskStore.numberOfUncompletedTasks}
              color="error"
            >
              <Inbox />
            </Badge>
          </ListItemIcon>
          <ListItemText primary="Inbox" sx={LIST_ITEM_TEXT_SX} />
        </ListItemButton>
        <ListItemButton
          key="Archive"
          selected={stores.commonStore.currentTab === Tab.Archive}
          onClick={() => {
            handleTabChange(Tab.Archive);
          }}
        >
          <ListItemIcon sx={LIST_ITEM_ICON_SX}>
            <Archive />
          </ListItemIcon>
          <ListItemText primary="Archive" sx={LIST_ITEM_TEXT_SX} />
        </ListItemButton>
        <ListItemButton
          key="Sent"
          selected={stores.commonStore.currentTab === Tab.Sent}
          onClick={() => {
            handleTabChange(Tab.Sent);
          }}
        >
          <ListItemIcon sx={LIST_ITEM_ICON_SX}>
            <Send />
          </ListItemIcon>
          <ListItemText primary="Sent" sx={LIST_ITEM_TEXT_SX} />
        </ListItemButton>
      </List>
    </Box>
  );
};

export default observer(TabsNavBar);
