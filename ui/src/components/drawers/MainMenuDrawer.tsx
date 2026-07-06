import {
  Business,
  ChevronLeft,
  HelpOutline,
  Inbox,
  ManageAccounts,
  Outbox,
} from "@mui/icons-material";
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListSubheader,
  ListItemText,
  Toolbar,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { observer } from "mobx-react-lite";
import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { UI_BASE_URI } from "../../data/constants";
import { TenantUserRole } from "../../models/tenant";
import { stores } from "../../stores/stores";

export const MAIN_MENU_DRAWER_WIDTH = 240;

const MainMenuDrawer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const initializedDesktopDrawer = useRef(false);

  const listItemIconSx = { minWidth: 35 };
  const currentTenant = stores.tenantStore.currentTenant;
  const currentUser = stores.userAccountStore.currentUser;
  const tenantUserManagerIsVisible =
    stores.productStore.tenantsAreEnabled &&
    currentTenant?.role === TenantUserRole.Admin;

  useEffect(() => {
    if (!currentUser) {
      initializedDesktopDrawer.current = false;
      return;
    }

    if (isDesktop && !initializedDesktopDrawer.current) {
      stores.commonStore.setMainMenuDrawerIsOpen(true);
      initializedDesktopDrawer.current = true;
    }
  }, [currentUser, isDesktop]);

  const closeTemporaryDrawer = () => {
    if (!isDesktop) {
      stores.commonStore.setMainMenuDrawerIsOpen(false);
    }
  };

  const sectionHeaderSx = {
    bgcolor: "transparent",
    color: "text.secondary",
    fontWeight: 600,
    lineHeight: 1,
    px: 2,
    pt: 2,
    pb: 1,
  };

  const drawerContent = (
    <Box>
      <Toolbar
        disableGutters
        sx={{ justifyContent: "flex-end", minHeight: 64, px: 1 }}
      >
        <IconButton
          aria-label="Collapse menu"
          onClick={() => stores.commonStore.setMainMenuDrawerIsOpen(false)}
        >
          <ChevronLeft />
        </IconButton>
      </Toolbar>
      <Divider />
      <List
        subheader={
          <ListSubheader component="div" sx={sectionHeaderSx}>
            Approvals
          </ListSubheader>
        }
      >
        <ListItem key="incoming" disablePadding>
          <ListItemButton
            selected={location.pathname === "/inbox"}
            onClick={() => {
              navigate("/inbox");
              closeTemporaryDrawer();
            }}
          >
            <ListItemIcon sx={listItemIconSx}>
              <Inbox />
            </ListItemIcon>
            <ListItemText primary="Incoming" />
          </ListItemButton>
        </ListItem>
        <ListItem key="outgoing" disablePadding>
          <ListItemButton
            selected={location.pathname === "/outbox"}
            onClick={() => {
              navigate("/outbox");
              closeTemporaryDrawer();
            }}
          >
            <ListItemIcon sx={listItemIconSx}>
              <Outbox />
            </ListItemIcon>
            <ListItemText primary="Outgoing" />
          </ListItemButton>
        </ListItem>
      </List>
      <List
        subheader={
          <ListSubheader component="div" sx={sectionHeaderSx}>
            Access
          </ListSubheader>
        }
      >
        <ListItem key="organizations" disablePadding>
          <ListItemButton disabled>
            <ListItemIcon sx={listItemIconSx}>
              <Business />
            </ListItemIcon>
            <ListItemText primary="Organizations" />
          </ListItemButton>
        </ListItem>
        {tenantUserManagerIsVisible && (
          <ListItem key="tenantUsers" disablePadding>
            <ListItemButton
              selected={location.pathname === "/tenantUsers"}
              onClick={() => {
                navigate("/tenantUsers");
                closeTemporaryDrawer();
              }}
            >
              <ListItemIcon sx={listItemIconSx}>
                <ManageAccounts />
              </ListItemIcon>
              <ListItemText primary="Employees" />
            </ListItemButton>
          </ListItem>
        )}
      </List>
      <List
        subheader={
          <ListSubheader component="div" sx={sectionHeaderSx}>
            Docs
          </ListSubheader>
        }
      >
        <ListItem key="help" disablePadding>
          <ListItemButton
            component="a"
            href={UI_BASE_URI}
            onClick={closeTemporaryDrawer}
          >
            <ListItemIcon sx={listItemIconSx}>
              <HelpOutline />
            </ListItemIcon>
            <ListItemText primary="Help" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  if (!currentUser) {
    return null;
  }

  return (
    <Box
      component="nav"
      sx={{
        width: {
          md: stores.commonStore.mainMenuDrawerIsOpen
            ? MAIN_MENU_DRAWER_WIDTH
            : 0,
        },
        flexShrink: { md: 0 },
        transition: (theme) =>
          theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
      }}
    >
      <Drawer
        variant="temporary"
        open={stores.commonStore.mainMenuDrawerIsOpen}
        onClose={() => stores.commonStore.setMainMenuDrawerIsOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: MAIN_MENU_DRAWER_WIDTH,
          },
        }}
      >
        {drawerContent}
      </Drawer>
      <Drawer
        variant="persistent"
        open={stores.commonStore.mainMenuDrawerIsOpen}
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: MAIN_MENU_DRAWER_WIDTH,
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default observer(MainMenuDrawer);
