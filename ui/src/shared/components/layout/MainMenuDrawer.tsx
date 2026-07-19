import { stores } from "@/app/rootStore";
import { EmployeeRole, TenantType } from "@/features/tenants/models/tenant";
import { Api, Lists, Refresh, Routes, Shell } from "@/shared/constants/constants";
import {
  Business,
  ChevronLeft,
  Create,
  Description,
  Diversity3,
  Groups,
  HelpOutline,
  Inbox,
  Outbox,
  Person,
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
  const delegationsIsVisible =
    currentTenant?.type === TenantType.Business &&
    currentTenant.role === EmployeeRole.Admin;
  const teamsManagerIsVisible =
    employeeManagerIsVisible && stores.productStore.teamApproversAreEnabled;
  const templatesIsVisible =
    stores.productStore.approvalStepTemplatesAreEnabled &&
    currentTenant?.type === TenantType.Business &&
    currentTenant?.role !== undefined;
  const currentTenantId = stores.tenantStore.currentTenantId;
  const tenantScopeIsReady =
    stores.tenantStore.hasLoaded && currentTenantId !== null;
  const tenantPath = (path: string) =>
    currentTenantId ? Routes.tenantPath(currentTenantId, path) : "/";
  const inboxPath = tenantPath(Routes.inboxPath);
  const outboxPath = tenantPath("/outbox");
  const templatesPath = tenantPath("/approvalStepTemplates");
  const teamsPath = tenantPath("/teams");
  const employeesPath = tenantPath("/employees");
  const delegationsPath = tenantPath("/delegations");
  const inboxIsSelected =
    location.pathname === "/" ||
    location.pathname.startsWith(inboxPath);
  const outboxIsSelected = location.pathname.startsWith(outboxPath);
  const numberOfUncompletedTasks =
    stores.approvalRequestTaskStore.numberOfUncompletedTasks;
  const organizationsIsSelected = /^\/tenants(?:\/[^/]+)?$/.test(
    location.pathname
  );

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

  useEffect(() => {
    if (!currentUser || !tenantScopeIsReady) {
      return;
    }

    stores.approvalRequestTaskStore.loadUncompletedCount();
    if (Refresh.uncompletedTasksMs <= 0) {
      return;
    }

    const intervalId = window.setInterval(() => {
      stores.approvalRequestTaskStore.loadUncompletedCount();
    }, Refresh.uncompletedTasksMs);
    return () => window.clearInterval(intervalId);
  }, [currentUser, tenantScopeIsReady]);

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
              navigate(`${outboxPath}/new`);
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
              navigate(inboxPath);
              closeTemporaryDrawer();
            }}
          >
            <ListItemIcon sx={Lists.itemIconSx}>
              <Inbox />
            </ListItemIcon>
            <ListItemText
              primary={
                numberOfUncompletedTasks > 0
                  ? `Inbox (${numberOfUncompletedTasks})`
                  : "Inbox"
              }
              primaryTypographyProps={{
                fontWeight: numberOfUncompletedTasks > 0 ? "bold" : undefined,
              }}
            />
          </ListItemButton>
        </ListItem>
        <ListItem key="outgoing" disablePadding>
          <ListItemButton
            selected={outboxIsSelected}
            onClick={() => {
              navigate(outboxPath);
              closeTemporaryDrawer();
            }}
          >
            <ListItemIcon sx={Lists.itemIconSx}>
              <Outbox />
            </ListItemIcon>
            <ListItemText primary="Outbox" />
          </ListItemButton>
        </ListItem>
        {templatesIsVisible && (
          <ListItem key="approvalStepTemplates" disablePadding>
            <ListItemButton
              selected={location.pathname.startsWith(templatesPath)}
              onClick={() => {
                navigate(templatesPath);
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
              selected={organizationsIsSelected}
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
              selected={location.pathname.startsWith(teamsPath)}
              onClick={() => {
                navigate(teamsPath);
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
              selected={location.pathname.startsWith(employeesPath)}
              onClick={() => {
                navigate(employeesPath);
                closeTemporaryDrawer();
              }}
            >
              <ListItemIcon sx={Lists.itemIconSx}>
                <Person />
              </ListItemIcon>
              <ListItemText primary="Employees" />
            </ListItemButton>
          </ListItem>
        )}
        {delegationsIsVisible && (
          <ListItem key="delegations" disablePadding>
            <ListItemButton
              selected={location.pathname.startsWith(delegationsPath)}
              onClick={() => {
                navigate(delegationsPath);
                closeTemporaryDrawer();
              }}
            >
              <ListItemIcon sx={Lists.itemIconSx}>
                <Diversity3 />
              </ListItemIcon>
              <ListItemText primary="Delegations" />
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
        open={!isDesktop && stores.commonStore.mainMenuDrawerIsOpen}
        onClose={() => stores.commonStore.setMainMenuDrawerIsOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={Shell.temporaryDrawerSx}
      >
        {drawerContent}
      </Drawer>
      <Drawer
        variant="persistent"
        open={isDesktop && stores.commonStore.mainMenuDrawerIsOpen}
        sx={Shell.persistentDrawerSx}
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default observer(MainMenuDrawer);
