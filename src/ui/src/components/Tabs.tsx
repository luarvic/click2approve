import { Archive, AttachFile, Inbox, Send } from "@mui/icons-material";
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import { Tab, commonStore } from "../stores/CommonStore";

// Tabs (Files, Inbox, Archive, Sent).
const Tabs = () => {
  const { getCurrentTab, setCurrentTab } = commonStore;
  const navigate = useNavigate();

  return (
    <Box sx={{ pr: 2 }}>
      <List disablePadding>
        <ListItemButton
          selected={getCurrentTab() === Tab.Files}
          onClick={() => {
            setCurrentTab(Tab.Files);
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
            setCurrentTab(Tab.Inbox);
            navigate("/inbox");
          }}
        >
          <ListItemIcon>
            <Inbox />
          </ListItemIcon>
          <ListItemText primary="Inbox" />
        </ListItemButton>
        <ListItemButton
          selected={getCurrentTab() === Tab.Archive}
          onClick={() => {
            setCurrentTab(Tab.Archive);
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
            setCurrentTab(Tab.Sent);
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
