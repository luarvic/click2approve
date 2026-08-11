import { stores } from "@/app/rootStore";
import { getPublicApiUrl } from "@/shared/api/userProfilesApi";
import DisplayName from "@/shared/components/identity/DisplayName";
import { Lists, Shell } from "@/shared/constants/constants";
import { getUserProfileName } from "@/shared/utils/displayNameHelpers";
import { Logout, Settings } from "@mui/icons-material";
import {
  Avatar,
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

const ProfileDrawer = () => {
  const navigate = useNavigate();
  const profile = stores.userProfileStore.profile;
  const email = stores.userAccountStore.currentUser?.email;
  const displayName = getUserProfileName(profile);

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
        <List>
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
                disableTypography
                primary={<DisplayName displayName={displayName} email={email} />}
              />
            </ListItemButton>
          </ListItem>
          <Divider />
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
