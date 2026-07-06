import {
  Business,
  ChevronLeft,
  Create,
  HelpOutline,
  Inbox,
  ManageAccounts,
  Outbox,
} from "@mui/icons-material";
import {
  Box,
  Button,
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
import {
  DRAWER_COMPOSE_ACTION_CONTAINER_SX,
  DRAWER_COMPOSE_BUTTON_SX,
  LIST_ITEM_ICON_SX,
  LIST_SECTION_HEADER_SX,
  MAIN_MENU_DRAWER_NAV_SX,
  MAIN_MENU_DRAWER_TOOLBAR_SX,
  PERSISTENT_DRAWER_SX,
  TEMPORARY_DRAWER_SX,
  UI_BASE_URI,
} from "../../data/constants";
import { TenantUserRole } from "../../models/tenant";
import { stores } from "../../stores/stores";

const MainMenuDrawer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const initializedDesktopDrawer = useRef(false);

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

  const drawerContent = (
    <Box>
      <Toolbar
        disableGutters
        sx={MAIN_MENU_DRAWER_TOOLBAR_SX}
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
          <ListSubheader component="div" sx={LIST_SECTION_HEADER_SX}>
            Approval Requests
          </ListSubheader>
        }
      >
        <Box sx={DRAWER_COMPOSE_ACTION_CONTAINER_SX}>
          <Button
            fullWidth
            variant="outlined"
            size="large"
            startIcon={<Create />}
            onClick={() => {
              stores.commonStore.setApprovalRequestSubmitDialogIsOpen(true);
              closeTemporaryDrawer();
            }}
            sx={DRAWER_COMPOSE_BUTTON_SX}
          >
            Compose
          </Button>
        </Box>
        <ListItem key="incoming" disablePadding>
          <ListItemButton
            selected={location.pathname === "/inbox"}
            onClick={() => {
              navigate("/inbox");
              closeTemporaryDrawer();
            }}
          >
            <ListItemIcon sx={LIST_ITEM_ICON_SX}>
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
            <ListItemIcon sx={LIST_ITEM_ICON_SX}>
              <Outbox />
            </ListItemIcon>
            <ListItemText primary="Outgoing" />
          </ListItemButton>
        </ListItem>
      </List>
      <List
        subheader={
          <ListSubheader component="div" sx={LIST_SECTION_HEADER_SX}>
            Access
          </ListSubheader>
        }
      >
        <ListItem key="organizations" disablePadding>
          <ListItemButton disabled>
            <ListItemIcon sx={LIST_ITEM_ICON_SX}>
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
              <ListItemIcon sx={LIST_ITEM_ICON_SX}>
                <ManageAccounts />
              </ListItemIcon>
              <ListItemText primary="Employees" />
            </ListItemButton>
          </ListItem>
        )}
      </List>
      <List
        subheader={
          <ListSubheader component="div" sx={LIST_SECTION_HEADER_SX}>
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
            <ListItemIcon sx={LIST_ITEM_ICON_SX}>
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
      sx={MAIN_MENU_DRAWER_NAV_SX(stores.commonStore.mainMenuDrawerIsOpen)}
    >
      <Drawer
        variant="temporary"
        open={stores.commonStore.mainMenuDrawerIsOpen}
        onClose={() => stores.commonStore.setMainMenuDrawerIsOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={TEMPORARY_DRAWER_SX}
      >
        {drawerContent}
      </Drawer>
      <Drawer
        variant="persistent"
        open={stores.commonStore.mainMenuDrawerIsOpen}
        sx={PERSISTENT_DRAWER_SX}
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default observer(MainMenuDrawer);
