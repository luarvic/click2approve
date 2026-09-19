import { stores } from "@/app/rootStore";
import { TenantType } from "@/features/tenants/models/tenant";
import { Shell } from "@/shared/components/layout/shellStyles";
import { Lists } from "@/shared/components/lists/listStyles";
import { Api, Refresh } from "@/shared/config/application";
import { Routes } from "@/shared/routing/routes";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
import {
  AddTwoTone,
  AssignmentTurnedInTwoTone,
  AssignmentTwoTone,
  AutoDeleteTwoTone,
  BusinessTwoTone,
  ContentCopyTwoTone,
  GroupsTwoTone,
  HelpCenterTwoTone,
  PeopleAltTwoTone,
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
  Link,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { observer } from "mobx-react-lite";
import { useEffect, useRef } from "react";
import { useLocation, useMatch, useNavigate } from "react-router-dom";

const tasksTextBadgeSx: SxProps<Theme> = {
  display: "inline-flex",
  "& .MuiBadge-badge": {
    right: 0,
    top: 0,
    transform: "translate(100%, -50%)",
  },
};

const baseUrl = import.meta.env.BASE_URL.endsWith("/") ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;
const logoSrc = `${baseUrl}logo.svg`;

const MainMenuDrawer = () => {
  const location = useLocation();
  const isPlansPage = Boolean(useMatch("/tenants/:tenantGlobalId/plans"));
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
  const tenantIsBlocked = currentTenantGlobalId !== null && stores.billingAccessStore.isBlocked(currentTenantGlobalId);
  const tenantPath = (path: string) => (currentTenantGlobalId ? Routes.tenantPath(currentTenantGlobalId, path) : "/");
  const tasksPath = tenantPath(Routes.tasksPath);
  const requestsPath = tenantPath("/requests");
  const receiptsPath = tenantPath("/receipts");
  const templatesPath = tenantPath("/approvalStepTemplates");
  const teamsPath = tenantPath("/teams");
  const employeesPath = tenantPath("/employees");
  const delegationsPath = tenantPath("/delegations");
  const subscriptionPlanPath = tenantPath("/plans");
  const subscriptionUsagePath = tenantPath("/usage");
  const subscriptionRetentionPath = tenantPath("/retention");
  const selectedMenuPath = stores.commonStore.isActionLoading(ActionLoaders.pages.tenantScope())
    ? (stores.commonStore.currentMenuPath ?? Routes.tasksPath)
    : undefined;
  const tasksAreSelected =
    selectedMenuPath === undefined
      ? location.pathname === "/" || location.pathname.startsWith(tasksPath)
      : selectedMenuPath === Routes.tasksPath;
  const requestsAreSelected =
    selectedMenuPath === undefined ? location.pathname.startsWith(requestsPath) : selectedMenuPath === "/requests";
  const numberOfUncompletedTasks = stores.approvalRequestTaskStore.numberOfUncompletedTasks;
  const organizationsIsSelected =
    selectedMenuPath === undefined
      ? /^\/tenants(?:\/[^/]+)?$/.test(location.pathname) || location.pathname.startsWith("/tenants/new/")
      : selectedMenuPath === "/tenants";

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
    if (!currentUser || !tenantScopeIsReady || tenantIsBlocked || isPlansPage) {
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
      if (tenantGlobalId && !stores.billingAccessStore.isBlocked(tenantGlobalId)) {
        stores.approvalRequestTaskStore.loadUncompletedCount(tenantGlobalId);
      }
    }, Refresh.uncompletedTasksMs);
    return () => window.clearInterval(intervalId);
  }, [currentUser, currentTenantGlobalId, tenantScopeIsReady, tenantIsBlocked, isPlansPage]);

  const closeTemporaryDrawer = () => {
    if (!isDesktop) {
      stores.commonStore.setMainMenuDrawerIsOpen(false);
    }
  };

  const navigateWorkspaceMenu = (path: string) => {
    stores.commonStore.setCurrentMenuPath(path);
    navigate(tenantPath(path));
    closeTemporaryDrawer();
  };

  const drawerContent = (
    <Box>
      <Toolbar disableGutters sx={Shell.mainMenuDrawerToolbarSx}>
        <Link
          component="button"
          variant="body2"
          aria-label="Click2Approve home"
          sx={Shell.appBarBrandLinkSx}
          onClick={() => navigateWorkspaceMenu(Routes.tasksPath)}
        >
          <Box component="img" src={logoSrc} alt="" aria-hidden="true" sx={Shell.appBarLogoSx} />
          <Typography variant="h6" sx={Shell.appBarBrandTitleSx}>
            Click2Approve
          </Typography>
        </Link>
      </Toolbar>
      <Box sx={Shell.mainMenuDrawerContentSx}>
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
                    stores.commonStore.setCurrentMenuPath("/requests");
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
                if (currentTenantGlobalId && !tenantIsBlocked) {
                  stores.approvalRequestTaskStore.loadUncompletedCount(currentTenantGlobalId);
                }
                navigateWorkspaceMenu(Routes.tasksPath);
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
                navigateWorkspaceMenu("/requests");
              }}
            >
              <ListItemIcon sx={Lists.itemIconSx}>
                <AssignmentTwoTone />
              </ListItemIcon>
              <ListItemText primary="Requests" />
            </ListItemButton>
          </ListItem>
          {receiptsIsVisible && (
            <ListItem key="receipts" disablePadding>
              <ListItemButton
                selected={
                  selectedMenuPath === undefined
                    ? location.pathname.startsWith(receiptsPath)
                    : selectedMenuPath === "/receipts"
                }
                onClick={() => {
                  navigateWorkspaceMenu("/receipts");
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
                selected={
                  selectedMenuPath === undefined
                    ? location.pathname.startsWith(templatesPath)
                    : selectedMenuPath === "/approvalStepTemplates"
                }
                onClick={() => {
                  navigateWorkspaceMenu("/approvalStepTemplates");
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
                  stores.commonStore.setCurrentMenuPath("/tenants");
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
                  selected={
                    selectedMenuPath === undefined
                      ? location.pathname.startsWith(employeesPath)
                      : selectedMenuPath === "/employees"
                  }
                  onClick={() => {
                    navigateWorkspaceMenu("/employees");
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
                  selected={
                    selectedMenuPath === undefined
                      ? location.pathname.startsWith(teamsPath)
                      : selectedMenuPath === "/teams"
                  }
                  onClick={() => {
                    navigateWorkspaceMenu("/teams");
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
                  selected={
                    selectedMenuPath === undefined
                      ? location.pathname.startsWith(delegationsPath)
                      : selectedMenuPath === "/delegations"
                  }
                  onClick={() => {
                    navigateWorkspaceMenu("/delegations");
                  }}
                >
                  <ListItemIcon sx={Lists.itemIconSx}>
                    <PeopleAltTwoTone />
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
                selected={
                  selectedMenuPath === undefined
                    ? location.pathname.startsWith(subscriptionPlanPath)
                    : selectedMenuPath === "/plans"
                }
                onClick={() => {
                  navigateWorkspaceMenu("/plans");
                }}
              >
                <ListItemIcon sx={Lists.itemIconSx}>
                  <StyleTwoTone />
                </ListItemIcon>
                <ListItemText primary="Plans" />
              </ListItemButton>
            </ListItem>
            <ListItem key="subscriptionUsage" disablePadding>
              <ListItemButton
                selected={
                  selectedMenuPath === undefined
                    ? location.pathname.startsWith(subscriptionUsagePath)
                    : selectedMenuPath === "/usage"
                }
                onClick={() => {
                  navigateWorkspaceMenu("/usage");
                }}
              >
                <ListItemIcon sx={Lists.itemIconSx}>
                  <ShowChartTwoTone />
                </ListItemIcon>
                <ListItemText primary="Usage" />
              </ListItemButton>
            </ListItem>
            <ListItem key="subscriptionRetention" disablePadding>
              <ListItemButton
                selected={
                  selectedMenuPath === undefined
                    ? location.pathname.startsWith(subscriptionRetentionPath)
                    : selectedMenuPath === "/retention"
                }
                onClick={() => {
                  navigateWorkspaceMenu("/retention");
                }}
              >
                <ListItemIcon sx={Lists.itemIconSx}>
                  <AutoDeleteTwoTone />
                </ListItemIcon>
                <ListItemText primary="Retention" />
              </ListItemButton>
            </ListItem>
          </List>
        )}
        <List subheader={<ListSubheader component="div">Support</ListSubheader>}>
          <ListItem key="help" disablePadding>
            <ListItemButton component="a" href={Api.uiBaseUri} onClick={closeTemporaryDrawer}>
              <ListItemIcon sx={Lists.itemIconSx}>
                <HelpCenterTwoTone />
              </ListItemIcon>
              <ListItemText primary="Help" />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
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
