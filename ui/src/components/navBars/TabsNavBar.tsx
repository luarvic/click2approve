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
import { DISPLAY_DEPENDING_ON_SIZE } from "../../stores/constantsStore";

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

  const listItemIconSx = { minWidth: 0, my: "4px" };
  const listItemTextSx = {
    display: DISPLAY_DEPENDING_ON_SIZE,
    ml: 2,
  };
  const listItemButtonSx = { borderRadius: "0 20px 20px 0" };

  return (
    <Box sx={{ pr: 2 }}>
      <List disablePadding>
        <ListItemButton
          key="Files"
          selected={stores.commonStore.currentTab === Tab.Files}
          onClick={() => {
            handleTabChange(Tab.Files);
          }}
          sx={listItemButtonSx}
        >
          <ListItemIcon sx={listItemIconSx}>
            <InsertDriveFile />
          </ListItemIcon>
          <ListItemText primary="Files" sx={listItemTextSx} />
        </ListItemButton>
        <ListItemButton
          key="Inbox"
          selected={stores.commonStore.currentTab === Tab.Inbox}
          onClick={() => {
            handleTabChange(Tab.Inbox);
          }}
          sx={listItemButtonSx}
        >
          <ListItemIcon sx={listItemIconSx}>
            <Badge
              badgeContent={stores.taskStore.numberOfUncompletedTasks}
              color="error"
            >
              <Inbox />
            </Badge>
          </ListItemIcon>
          <ListItemText primary="Inbox" sx={listItemTextSx} />
        </ListItemButton>
        <ListItemButton
          key="Archive"
          selected={stores.commonStore.currentTab === Tab.Archive}
          onClick={() => {
            handleTabChange(Tab.Archive);
          }}
          sx={listItemButtonSx}
        >
          <ListItemIcon sx={listItemIconSx}>
            <Archive />
          </ListItemIcon>
          <ListItemText primary="Archive" sx={listItemTextSx} />
        </ListItemButton>
        <ListItemButton
          key="Sent"
          selected={stores.commonStore.currentTab === Tab.Sent}
          onClick={() => {
            handleTabChange(Tab.Sent);
          }}
          sx={listItemButtonSx}
        >
          <ListItemIcon sx={listItemIconSx}>
            <Send />
          </ListItemIcon>
          <ListItemText primary="Sent" sx={listItemTextSx} />
        </ListItemButton>
      </List>
    </Box>
  );
};

export default observer(TabsNavBar);
