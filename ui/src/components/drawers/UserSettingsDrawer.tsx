import { HelpOutline, Home, Logout, ManageAccounts } from "@mui/icons-material";
import {
  Box,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import { stores } from "../../stores/Stores";
import { DEFAULT_PATH } from "../../stores/constantsStore";

const UserSettingsDrawer = () => {
  const navigate = useNavigate();

  const listItemIconSx = { minWidth: 35 };

  return (
    <Drawer
      anchor="right"
      open={stores.commonStore.userSettingsDrawerIsOpen}
      onClose={() => stores.commonStore.setUserSettingsDrawerIsOpen(false)}
    >
      <Box
        onClick={() => stores.commonStore.setUserSettingsDrawerIsOpen(false)}
      >
        <List>
          <ListItem key="manageAccount" disablePadding>
            <ListItemButton onClick={() => navigate("/userSettings")}>
              <ListItemIcon sx={listItemIconSx}>
                <ManageAccounts />
              </ListItemIcon>
              <ListItemText
                primary={stores.userAccountStore.currentUser?.email.toLowerCase()}
              />
            </ListItemButton>
          </ListItem>
          <ListItem key="filesAndRequests" disablePadding>
            <ListItemButton onClick={() => navigate(DEFAULT_PATH)}>
              <ListItemIcon sx={listItemIconSx}>
                <Home />
              </ListItemIcon>
              <ListItemText primary="Home" />
            </ListItemButton>
          </ListItem>
          <ListItem key="help" disablePadding>
            <ListItemButton onClick={() => navigate("/help")}>
              <ListItemIcon sx={listItemIconSx}>
                <HelpOutline />
              </ListItemIcon>
              <ListItemText primary="Help" />
            </ListItemButton>
          </ListItem>
        </List>
        <Divider />
        <List>
          <ListItem key="signOut" disablePadding>
            <ListItemButton
              onClick={() => {
                stores.userAccountStore.signOut();
                navigate("/");
              }}
            >
              <ListItemIcon sx={listItemIconSx}>
                <Logout />
              </ListItemIcon>
              <ListItemText primary="Sign out" />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
};

export default observer(UserSettingsDrawer);
