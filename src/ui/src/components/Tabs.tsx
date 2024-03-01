import { Archive, AttachFile, Inbox, Send } from "@mui/icons-material";
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { Tab, commonStore } from "../stores/CommonStore";

export const Tabs = () => {
  const { getCurrentTab, setCurrentTab } = commonStore;

  return (
    <Box sx={{ pr: 2 }}>
      <List disablePadding>
        <ListItemButton
          selected={getCurrentTab() === Tab.Files}
          onClick={() => setCurrentTab(Tab.Files)}
        >
          <ListItemIcon>
            <AttachFile />
          </ListItemIcon>
          <ListItemText primary="Files" />
        </ListItemButton>
        <ListItemButton
          selected={getCurrentTab() === Tab.Inbox}
          onClick={() => setCurrentTab(Tab.Inbox)}
        >
          <ListItemIcon>
            <Inbox />
          </ListItemIcon>
          <ListItemText primary="Inbox" />
        </ListItemButton>
        <ListItemButton
          selected={getCurrentTab() === Tab.Archive}
          onClick={() => setCurrentTab(Tab.Archive)}
        >
          <ListItemIcon>
            <Archive />
          </ListItemIcon>
          <ListItemText primary="Archive" />
        </ListItemButton>
        <ListItemButton
          selected={getCurrentTab() === Tab.Sent}
          onClick={() => setCurrentTab(Tab.Sent)}
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
