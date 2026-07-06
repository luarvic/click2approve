import {
  Logout,
  Settings,
} from "@mui/icons-material";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListSubheader,
  ListItemText,
} from "@mui/material";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import {
  LIST_ITEM_ICON_SX,
  LIST_SECTION_HEADER_SX,
  PROFILE_DRAWER_CONTENT_SX,
} from "../../data/constants";
import { stores } from "../../stores/stores";

const ProfileDrawer = () => {
  const navigate = useNavigate();

  return (
    <Drawer
      anchor="right"
      open={stores.commonStore.profileDrawerIsOpen}
      onClose={() => stores.commonStore.setProfileDrawerIsOpen(false)}
    >
      <Box
        sx={PROFILE_DRAWER_CONTENT_SX}
        onClick={() => stores.commonStore.setProfileDrawerIsOpen(false)}
      >
        <List
          subheader={
            <ListSubheader component="div" sx={LIST_SECTION_HEADER_SX}>
              Profile
            </ListSubheader>
          }
        >
          <ListItem key="manageAccount" disablePadding>
            <ListItemButton onClick={() => navigate("/userSettings")}>
              <ListItemIcon sx={LIST_ITEM_ICON_SX}>
                <Settings />
              </ListItemIcon>
              <ListItemText
                primary={stores.userAccountStore.currentUser?.email.toLowerCase()}
              />
            </ListItemButton>
          </ListItem>
          <ListItem key="signOut" disablePadding>
            <ListItemButton
              onClick={() => {
                stores.userAccountStore.signOut();
                navigate("/");
              }}
            >
              <ListItemIcon sx={LIST_ITEM_ICON_SX}>
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

export default observer(ProfileDrawer);
