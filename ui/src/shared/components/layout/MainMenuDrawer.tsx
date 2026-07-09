import { stores } from "@/app/stores";
import { TenantType } from "@/features/tenants/models/tenant";
import { Api, Lists, Routes, Shell } from "@/shared/constants/constants";
import {
  Business,
  ChevronLeft,
  Create,
  Description,
  Groups,
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
  ListItemText,
  ListSubheader,
  Toolbar,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { observer } from "mobx-react-lite";
import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const MainMenuDrawer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const initializedDesktopDrawer = useRef(false);

  const currentTenant = stores.tenantStore.currentTenant;
  const currentUser = stores.userAccountStore.currentUser;
  const organizationsIsVisible = stores.productStore.tenantsAreEnabled;
  const employeeManagerIsVisible =
    stores.productStore.tenantsAreEnabled &&
    currentTenant?.type === TenantType.Business &&
    currentTenant?.role !== undefined;
  const teamsManagerIsVisible =
    employeeManagerIsVisible && stores.productStore.teamApproversAreEnabled;
  const templatesIsVisible =
    stores.productStore.approvalStepTemplatesAreEnabled &&
    currentTenant?.type === TenantType.Business &&
    currentTenant?.role !== undefined;
  const inboxIsSelected =
    location.pathname === "/" || location.pathname === Routes.defaultPath;

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
      <Toolbar disableGutters sx={Shell.mainMenuDrawerToolbarSx}>
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
          <ListSubheader component="div" sx={Lists.sectionHeaderSx}>
            Approval Requests
          </ListSubheader>
        }
      >
        <Box sx={Shell.drawerComposeActionContainerSx}>
          <Button
            fullWidth
            variant="outlined"
            size="large"
            startIcon={<Create />}
            onClick={() => {
              stores.commonStore.setApprovalRequestSubmitDialogIsOpen(true);
              closeTemporaryDrawer();
            }}
            sx={Shell.drawerComposeButtonSx}
          >
            Compose
          </Button>
        </Box>
        <ListItem key="incoming" disablePadding>
          <ListItemButton
            selected={inboxIsSelected}
            onClick={() => {
              navigate("/inbox");
              closeTemporaryDrawer();
            }}
          >
            <ListItemIcon sx={Lists.itemIconSx}>
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
            <ListItemIcon sx={Lists.itemIconSx}>
              <Outbox />
            </ListItemIcon>
            <ListItemText primary="Outgoing" />
          </ListItemButton>
        </ListItem>
        {templatesIsVisible && (
          <ListItem key="approvalStepTemplates" disablePadding>
            <ListItemButton
              selected={location.pathname === "/approvalStepTemplates"}
              onClick={() => {
                navigate("/approvalStepTemplates");
                closeTemporaryDrawer();
              }}
            >
              <ListItemIcon sx={Lists.itemIconSx}>
                <Description />
              </ListItemIcon>
              <ListItemText primary="Templates" />
            </ListItemButton>
          </ListItem>
        )}
      </List>
      <List
        subheader={
          <ListSubheader component="div" sx={Lists.sectionHeaderSx}>
            Access
          </ListSubheader>
        }
      >
        {organizationsIsVisible && (
          <ListItem key="organizations" disablePadding>
            <ListItemButton
              selected={location.pathname === "/tenants"}
              onClick={() => {
                navigate("/tenants");
                closeTemporaryDrawer();
              }}
            >
              <ListItemIcon sx={Lists.itemIconSx}>
                <Business />
              </ListItemIcon>
              <ListItemText primary="Organizations" />
            </ListItemButton>
          </ListItem>
        )}
        {teamsManagerIsVisible && (
          <ListItem key="teams" disablePadding>
            <ListItemButton
              selected={location.pathname === "/teams"}
              onClick={() => {
                navigate("/teams");
                closeTemporaryDrawer();
              }}
            >
              <ListItemIcon sx={Lists.itemIconSx}>
                <Groups />
              </ListItemIcon>
              <ListItemText primary="Teams" />
            </ListItemButton>
          </ListItem>
        )}
        {employeeManagerIsVisible && (
          <ListItem key="employees" disablePadding>
            <ListItemButton
              selected={location.pathname === "/employees"}
              onClick={() => {
                navigate("/employees");
                closeTemporaryDrawer();
              }}
            >
              <ListItemIcon sx={Lists.itemIconSx}>
                <ManageAccounts />
              </ListItemIcon>
              <ListItemText primary="Employees" />
            </ListItemButton>
          </ListItem>
        )}
      </List>
      <List
        subheader={
          <ListSubheader component="div" sx={Lists.sectionHeaderSx}>
            Docs
          </ListSubheader>
        }
      >
        <ListItem key="help" disablePadding>
          <ListItemButton
            component="a"
            href={Api.uiBaseUri}
            onClick={closeTemporaryDrawer}
          >
            <ListItemIcon sx={Lists.itemIconSx}>
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
      sx={Shell.mainMenuDrawerNavSx(stores.commonStore.mainMenuDrawerIsOpen)}
    >
      <Drawer
        variant="temporary"
        open={stores.commonStore.mainMenuDrawerIsOpen}
        onClose={() => stores.commonStore.setMainMenuDrawerIsOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={Shell.temporaryDrawerSx}
      >
        {drawerContent}
      </Drawer>
      <Drawer
        variant="persistent"
        open={stores.commonStore.mainMenuDrawerIsOpen}
        sx={Shell.persistentDrawerSx}
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default observer(MainMenuDrawer);
