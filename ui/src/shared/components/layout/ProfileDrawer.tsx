import { stores } from "@/app/rootStore";
import { clearPendingReturnUrl } from "@/features/identity/routing/returnUrl";
import { getPublicApiUrl } from "@/shared/api/userProfilesApi";
import DisplayName from "@/shared/components/identity/DisplayName";
import { Shell } from "@/shared/components/layout/shellStyles";
import { Lists } from "@/shared/components/lists/listStyles";
import { confirmUnsavedChanges } from "@/shared/routing/unsavedChanges";
import { getUserProfileName } from "@/shared/utils/displayNameHelpers";
import { Close, Logout, Person } from "@mui/icons-material";
import {
  Avatar,
  Backdrop,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";

const ProfileDrawer = () => {
  const navigate = useNavigate();
  const profile = stores.userProfileStore.profile;
  const email = stores.userAccountStore.currentUser?.email;
  const displayName = getUserProfileName(profile);

  return (
    <>
      <Backdrop
        open={stores.commonStore.profileDrawerIsOpen}
        sx={Shell.profileDrawerBackdropSx}
        onClick={() => stores.commonStore.setProfileDrawerIsOpen(false)}
      />
      <Drawer
        anchor="right"
        ModalProps={{ hideBackdrop: true, sx: Shell.profileDrawerModalSx }}
        PaperProps={{ sx: Shell.profileDrawerPaperSx }}
        open={stores.commonStore.profileDrawerIsOpen}
        onClose={() => stores.commonStore.setProfileDrawerIsOpen(false)}
      >
        <Box sx={Shell.profileDrawerContentSx}>
          <Toolbar disableGutters sx={Shell.profileDrawerToolbarSx}>
            <Typography variant="h6">Settings</Typography>
            <IconButton
              aria-label="Close profile menu"
              onClick={() => stores.commonStore.setProfileDrawerIsOpen(false)}
            >
              <Close />
            </IconButton>
          </Toolbar>
          <List>
            <ListItem key="manageAccount" disablePadding>
              <ListItemButton
                onClick={() => {
                  stores.commonStore.setProfileDrawerIsOpen(false);
                  navigate("/userProfile");
                }}
              >
                <ListItemIcon sx={Lists.itemIconSx}>
                  <Avatar src={getPublicApiUrl(profile?.avatar)} sx={Shell.profileDrawerAvatarSx}>
                    <Person fontSize="small" />
                  </Avatar>
                </ListItemIcon>
                <ListItemText disableTypography primary={<DisplayName displayName={displayName} email={email} />} />
              </ListItemButton>
            </ListItem>
            <ListItem key="signOut" disablePadding>
              <ListItemButton
                onClick={() => {
                  if (!confirmUnsavedChanges()) return;
                  stores.commonStore.setProfileDrawerIsOpen(false);
                  clearPendingReturnUrl();
                  stores.userAccountStore.signOut(true);
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
    </>
  );
};

export default observer(ProfileDrawer);
