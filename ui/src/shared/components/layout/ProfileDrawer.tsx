import { stores } from "@/app/rootStore";
import { getPublicApiUrl } from "@/shared/api/userProfileApi";
import { Lists, Shell } from "@/shared/constants/constants";
import {
  getUserDisplayName,
  normalizeEmailForDisplay,
} from "@/shared/utils/displayNameHelpers";
import { Logout, Settings } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
} from "@mui/material";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";

const ProfileDrawer = () => {
  const navigate = useNavigate();
  const profile = stores.userProfileStore.profile;
  const email = stores.userAccountStore.currentUser?.email;
  const displayName = getUserDisplayName(profile, email);

  return (
    <Drawer
      anchor="right"
      open={stores.commonStore.profileDrawerIsOpen}
      onClose={() => stores.commonStore.setProfileDrawerIsOpen(false)}
    >
      <Box
        sx={Shell.profileDrawerContentSx}
        onClick={() => stores.commonStore.setProfileDrawerIsOpen(false)}
      >
        <List
          subheader={
            <ListSubheader component="div" sx={Lists.sectionHeaderSx}>
              Profile
            </ListSubheader>
          }
        >
          <ListItem key="manageAccount" disablePadding>
            <ListItemButton onClick={() => navigate("/userProfile")}>
              <ListItemIcon sx={Lists.itemIconSx}>
                <Avatar
                  src={getPublicApiUrl(profile?.avatar)}
                  sx={Shell.profileDrawerAvatarSx}
                >
                  <Settings fontSize="small" />
                </Avatar>
              </ListItemIcon>
              <ListItemText
                primary={displayName}
                secondary={normalizeEmailForDisplay(email)}
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
              <ListItemIcon sx={Lists.itemIconSx}>
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
