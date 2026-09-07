import { stores } from "@/app/rootStore";
import { TenantType } from "@/features/tenants/models/tenant";
import { Shell } from "@/shared/components/layout/shellStyles";
import { Lists } from "@/shared/components/lists/listStyles";
import { Api, Refresh } from "@/shared/config/application";
import { Routes } from "@/shared/routing/routes";
import {
  AddTwoTone,
  AssignmentTurnedInTwoTone,
  BallotTwoTone,
  BusinessTwoTone,
  ChevronLeftTwoTone,
  ContentCopyTwoTone,
  Diversity3TwoTone,
  GroupsTwoTone,
  HelpOutlineTwoTone,
  PersonTwoTone,
  ReceiptLongTwoTone,
  ShowChartTwoTone,
  StyleTwoTone,
} from "@mui/icons-material";
import type { SxProps, Theme } from "@mui/material";
import {
  Badge,
  Box,
  Button,
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

const tasksTextBadgeSx: SxProps<Theme> = {
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
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const initializedDesktopDrawer = useRef(false);

  const currentTenant = stores.tenantStore.currentTenant;
  const currentUser = stores.userAccountStore.currentUser;
  const organizationsIsVisible = stores.applicationConfigurationStore.tenantsAreEnabled;
  const receiptsIsVisible = stores.applicationConfigurationStore.receiptsAreEnabled;
  const subscriptionsIsVisible = stores.applicationConfigurationStore.subscriptionsAreEnabled;
  const employeeManagerIsVisible =
    stores.applicationConfigurationStore.tenantsAreEnabled &&
    currentTenant?.type === TenantType.Business &&
    currentTenant?.currentEmployeeRole !== undefined;
  const delegationsIsVisible =
    currentTenant?.type === TenantType.Business && currentTenant.currentEmployeeRole !== undefined;
  const teamsManagerIsVisible =
    employeeManagerIsVisible && stores.applicationConfigurationStore.teamAssigneesAreEnabled;
  const templatesIsVisible =
    stores.applicationConfigurationStore.approvalStepTemplatesAreEnabled &&
    currentTenant?.type === TenantType.Business &&
    currentTenant?.currentEmployeeRole !== undefined;
  const workspaceGroupIsVisible = employeeManagerIsVisible || teamsManagerIsVisible || delegationsIsVisible;
  const currentTenantGlobalId = stores.tenantStore.currentTenantGlobalId;
  const tenantScopeIsReady = stores.tenantStore.hasLoaded && currentTenantGlobalId !== null;
  const tenantPath = (path: string) => (currentTenantGlobalId ? Routes.tenantPath(currentTenantGlobalId, path) : "/");
  const tasksPath = tenantPath(Routes.tasksPath);
  const requestsPath = tenantPath("/requests");
  const receiptsPath = tenantPath("/receipts");
  const templatesPath = tenantPath("/approvalStepTemplates");
  const teamsPath = tenantPath("/teams");
  const employeesPath = tenantPath("/employees");
  const delegationsPath = tenantPath("/delegations");
  const subscriptionPlanPath = tenantPath("/plan");
  const subscriptionUsagePath = tenantPath("/usage");
  const tasksAreSelected = location.pathname === "/" || location.pathname.startsWith(tasksPath);
  const requestsAreSelected = location.pathname.startsWith(requestsPath);
  const numberOfUncompletedTasks = stores.approvalRequestTaskStore.numberOfUncompletedTasks;
  const organizationsIsSelected = /^\/tenants(?:\/[^/]+)?$/.test(location.pathname);

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
        <IconButton aria-label="Collapse menu" onClick={() => stores.commonStore.setMainMenuDrawerIsOpen(false)}>
          <ChevronLeftTwoTone />
        </IconButton>
      </Toolbar>
      <List
        sx={Shell.mainMenuDrawerFirstListSx}
        subheader={
          <ListSubheader component="div" sx={Lists.actionSubheaderSx}>
            <span>Work</span>
            <Tooltip title="Compose request">
              <Button
                aria-label="Compose request"
                color="primary"
                size="small"
                startIcon={<AddTwoTone />}
                onClick={() => {
                  navigate(`${requestsPath}/new`);
                  closeTemporaryDrawer();
                }}
              >
                New request
              </Button>
            </Tooltip>
          </ListSubheader>
        }
      >
        <ListItem key="incoming" disablePadding>
          <ListItemButton
            selected={tasksAreSelected}
            onClick={() => {
              if (currentTenantGlobalId) {
                stores.approvalRequestTaskStore.loadUncompletedCount(currentTenantGlobalId);
              }
              navigate(tasksPath);
              closeTemporaryDrawer();
            }}
          >
            <ListItemIcon sx={Lists.itemIconSx}>
              <AssignmentTurnedInTwoTone />
            </ListItemIcon>
            <ListItemText
              primary={
                numberOfUncompletedTasks > 0 ? (
                  <Badge badgeContent={numberOfUncompletedTasks} color="error" sx={tasksTextBadgeSx}>
                    <span>Tasks</span>
                  </Badge>
                ) : (
                  "Tasks"
                )
              }
            />
          </ListItemButton>
        </ListItem>
        <ListItem key="outgoing" disablePadding>
          <ListItemButton
            selected={requestsAreSelected}
            onClick={() => {
              navigate(requestsPath);
              closeTemporaryDrawer();
            }}
          >
            <ListItemIcon sx={Lists.itemIconSx}>
              <BallotTwoTone />
            </ListItemIcon>
            <ListItemText primary="Requests" />
          </ListItemButton>
        </ListItem>
        {receiptsIsVisible && (
          <ListItem key="receipts" disablePadding>
            <ListItemButton
              selected={location.pathname.startsWith(receiptsPath)}
              onClick={() => {
                navigate(receiptsPath);
                closeTemporaryDrawer();
              }}
            >
              <ListItemIcon sx={Lists.itemIconSx}>
                <ReceiptLongTwoTone />
              </ListItemIcon>
              <ListItemText primary="Receipts" />
            </ListItemButton>
          </ListItem>
        )}
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
                <ContentCopyTwoTone />
              </ListItemIcon>
              <ListItemText primary="Templates" />
            </ListItemButton>
          </ListItem>
        )}
      </List>
      {organizationsIsVisible && (
        <List subheader={<ListSubheader component="div">Access</ListSubheader>}>
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
        </List>
      )}
      {workspaceGroupIsVisible && (
        <List subheader={<ListSubheader component="div">People</ListSubheader>}>
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
      )}
      {subscriptionsIsVisible && (
        <List subheader={<ListSubheader component="div">Subscription</ListSubheader>}>
          <ListItem key="subscriptionPlan" disablePadding>
            <ListItemButton
              selected={location.pathname.startsWith(subscriptionPlanPath)}
              onClick={() => {
                navigate(subscriptionPlanPath);
                closeTemporaryDrawer();
              }}
            >
              <ListItemIcon sx={Lists.itemIconSx}>
                <StyleTwoTone />
              </ListItemIcon>
              <ListItemText primary="Plan" />
            </ListItemButton>
          </ListItem>
          <ListItem key="subscriptionUsage" disablePadding>
            <ListItemButton
              selected={location.pathname.startsWith(subscriptionUsagePath)}
              onClick={() => {
                navigate(subscriptionUsagePath);
                closeTemporaryDrawer();
              }}
            >
              <ListItemIcon sx={Lists.itemIconSx}>
                <ShowChartTwoTone />
              </ListItemIcon>
              <ListItemText primary="Usage" />
            </ListItemButton>
          </ListItem>
        </List>
      )}
      <List subheader={<ListSubheader component="div">Support</ListSubheader>}>
        <ListItem key="help" disablePadding>
          <ListItemButton component="a" href={Api.uiBaseUri} onClick={closeTemporaryDrawer}>
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
    <Box component="nav" sx={Shell.mainMenuDrawerNavSx(stores.commonStore.mainMenuDrawerIsOpen)}>
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
