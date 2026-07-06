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
import { stores } from "../../stores/stores";

const ProfileDrawer = () => {
  const navigate = useNavigate();

  const listItemIconSx = { minWidth: 35 };
  const sectionHeaderSx = {
    bgcolor: "transparent",
    color: "text.secondary",
    fontWeight: 600,
    lineHeight: 1,
    px: 2,
    pt: 2,
    pb: 1,
  };

  return (
    <Drawer
      anchor="right"
      open={stores.commonStore.profileDrawerIsOpen}
      onClose={() => stores.commonStore.setProfileDrawerIsOpen(false)}
    >
      <Box
        sx={{ minWidth: 280 }}
        onClick={() => stores.commonStore.setProfileDrawerIsOpen(false)}
      >
        <List
          subheader={
            <ListSubheader component="div" sx={sectionHeaderSx}>
              Profile
            </ListSubheader>
          }
        >
          <ListItem key="manageAccount" disablePadding>
            <ListItemButton onClick={() => navigate("/userSettings")}>
              <ListItemIcon sx={listItemIconSx}>
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

export default observer(ProfileDrawer);
