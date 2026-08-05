import { stores } from "@/app/rootStore";
import { EmployeeRole, TenantType } from "@/features/tenants/models/tenant";
import { Api, Lists, Refresh, Routes, Shell } from "@/shared/constants/constants";
import {
  AddTwoTone,
  BusinessTwoTone,
  ChevronLeftTwoTone,
  DescriptionTwoTone,
  Diversity3TwoTone,
  GroupsTwoTone,
  HelpOutlineTwoTone,
  InboxTwoTone,
  OutboxTwoTone,
  PersonTwoTone,
} from "@mui/icons-material";
import type { SxProps, Theme } from "@mui/material";
import {
  Badge,
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
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { observer } from "mobx-react-lite";
import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const inboxTextBadgeSx: SxProps<Theme> = {
  display: "inline-flex",
  "& .MuiBadge-badge": {
    right: 0,
    top: 0,
    transform: "translate(100%, -50%)",
  },
};

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
  const currentTenantGlobalId = stores.tenantStore.currentTenantGlobalId;
  const tenantScopeIsReady =
    stores.tenantStore.hasLoaded && currentTenantGlobalId !== null;
  const tenantPath = (path: string) =>
    currentTenantGlobalId ? Routes.tenantPath(currentTenantGlobalId, path) : "/";
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

    if (!isDesktop) {
      stores.commonStore.setMainMenuDrawerIsOpen(false);
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

    const tenantGlobalId = stores.tenantStore.currentTenantGlobalId;
    if (tenantGlobalId) {
      stores.approvalRequestTaskStore.loadUncompletedCount(tenantGlobalId);
    }
    if (Refresh.uncompletedTasksMs <= 0) {
      return;
    }

    const intervalId = window.setInterval(() => {
      const tenantGlobalId = stores.tenantStore.currentTenantGlobalId;
      if (tenantGlobalId) {
        stores.approvalRequestTaskStore.loadUncompletedCount(tenantGlobalId);
      }
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
          <ChevronLeftTwoTone />
        </IconButton>
      </Toolbar>
      <Divider />
      <List
        sx={Shell.mainMenuDrawerFirstListSx}
        subheader={
          <ListSubheader component="div" sx={Lists.actionSubheaderSx}>
            <span>Requests</span>
            <Tooltip title="Compose request">
              <Button
                aria-label="Compose request"
                color="primary"
                size="small"
                startIcon={<AddTwoTone />}
                onClick={() => {
                  navigate(`${outboxPath}/new`);
                  closeTemporaryDrawer();
                }}
              >
                CREATE
              </Button>
            </Tooltip>
          </ListSubheader>
        }
      >
        <ListItem key="incoming" disablePadding>
          <ListItemButton
            selected={inboxIsSelected}
            onClick={() => {
              if (currentTenantGlobalId) {
                stores.approvalRequestTaskStore.loadUncompletedCount(currentTenantGlobalId);
              }
              navigate(inboxPath);
              closeTemporaryDrawer();
            }}
          >
            <ListItemIcon sx={Lists.itemIconSx}>
              <InboxTwoTone />
            </ListItemIcon>
            <ListItemText
              primary={(
                numberOfUncompletedTasks > 0
                  ? (
                    <Badge
                      badgeContent={numberOfUncompletedTasks}
                      color="error"
                      sx={inboxTextBadgeSx}
                    >
                      <span>Inbox</span>
                    </Badge>
                  )
                  : "Inbox"
              )}
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
              <OutboxTwoTone />
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
                <DescriptionTwoTone />
              </ListItemIcon>
              <ListItemText primary="Templates" />
            </ListItemButton>
          </ListItem>
        )}
      </List>
      <List
        subheader={
          <ListSubheader component="div">
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
                <BusinessTwoTone />
              </ListItemIcon>
              <ListItemText primary="Organizations" />
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
                <PersonTwoTone />
              </ListItemIcon>
              <ListItemText primary="Employees" />
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
                <GroupsTwoTone />
              </ListItemIcon>
              <ListItemText primary="Teams" />
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
                <Diversity3TwoTone />
              </ListItemIcon>
              <ListItemText primary="Delegations" />
            </ListItemButton>
          </ListItem>
        )}
      </List>
      <List
        subheader={
          <ListSubheader component="div">
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
              <HelpOutlineTwoTone />
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
