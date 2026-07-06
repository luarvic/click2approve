import { AccountCircle, Menu, Notifications } from "@mui/icons-material";
import {
  AppBar,
  Badge,
  Box,
  Button,
  IconButton,
  Link,
  MenuItem,
  Popover,
  Select,
  Toolbar,
  Typography,
} from "@mui/material";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  APP_BAR_BRAND_CONTAINER_SX,
  APP_BAR_BRAND_LINK_SX,
  APP_BAR_BRAND_TITLE_SX,
  APP_BAR_LOGO_SX,
  APP_BAR_SX,
  APP_BAR_TOOLBAR_SX,
  DEFAULT_PATH,
  MAIN_MENU_BUTTON_SX,
  NOTIFICATION_POPOVER_ANCHOR_ORIGIN,
  NOTIFICATION_POPOVER_TEXT_SX,
  NOTIFICATION_POPOVER_TRANSFORM_ORIGIN,
  TENANT_PICKER_SX,
  UNCOMPLETED_TASKS_REFRESH_MS,
} from "../../data/constants";
import { stores } from "../../stores/stores";

const baseUrl = import.meta.env.BASE_URL.endsWith("/")
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`;
const logoSrc = `${baseUrl}logo.svg`;

const MainAppBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [notificationAnchor, setNotificationAnchor] =
    useState<HTMLElement | null>(null);
  const currentUser = stores.userAccountStore.currentUser;
  const mainMenuDrawerIsOpen = stores.commonStore.mainMenuDrawerIsOpen;
  const profileDrawerIsOpen = stores.commonStore.profileDrawerIsOpen;
  const mainMenuDrawerIsVisible =
    Boolean(currentUser) && mainMenuDrawerIsOpen;
  const tenantPickerIsVisible =
    stores.productStore.tenantsAreEnabled &&
    Boolean(currentUser) &&
    stores.tenantStore.tenants.length > 0;
  const tenantScopeIsReady =
    !stores.productStore.tenantsAreEnabled ||
    (stores.tenantStore.hasLoaded &&
      stores.tenantStore.currentTenantId !== null);
  const numberOfUncompletedTasks =
    stores.approvalRequestTaskStore.numberOfUncompletedTasks;

  useEffect(() => {
    if (!currentUser || !tenantScopeIsReady) {
      return;
    }

    stores.approvalRequestTaskStore.loadNumberOfUncompletedTasks();
    if (UNCOMPLETED_TASKS_REFRESH_MS <= 0) {
      return;
    }

    const intervalId = window.setInterval(() => {
      stores.approvalRequestTaskStore.loadNumberOfUncompletedTasks();
    }, UNCOMPLETED_TASKS_REFRESH_MS);
    return () => window.clearInterval(intervalId);
  }, [currentUser, tenantScopeIsReady]);

  return (
    <AppBar
      position="fixed"
      color="transparent"
      elevation={0}
      sx={APP_BAR_SX(mainMenuDrawerIsVisible, profileDrawerIsOpen)}
    >
      <Toolbar disableGutters sx={APP_BAR_TOOLBAR_SX}>
        {currentUser && (
          <IconButton
            color="inherit"
            edge="start"
            aria-label={mainMenuDrawerIsOpen ? "Close menu" : "Open menu"}
            onClick={() =>
              stores.commonStore.setMainMenuDrawerIsOpen(!mainMenuDrawerIsOpen)
            }
            sx={MAIN_MENU_BUTTON_SX(mainMenuDrawerIsOpen)}
          >
            <Menu />
          </IconButton>
        )}
        <Box sx={APP_BAR_BRAND_CONTAINER_SX}>
          <Link
            component="button"
            variant="body2"
            sx={APP_BAR_BRAND_LINK_SX}
            onClick={() => {
              navigate(
                currentUser ? DEFAULT_PATH : "/"
              );
            }}
          >
            <Box
              component="img"
              src={logoSrc}
              alt=""
              aria-hidden="true"
              sx={APP_BAR_LOGO_SX}
            />
            <Typography
              variant="h6"
              sx={APP_BAR_BRAND_TITLE_SX}
            >
              Click2approve
            </Typography>
          </Link>
        </Box>
        {tenantPickerIsVisible && (
          <Select
            size="small"
            value={stores.tenantStore.currentTenantId ?? ""}
            onChange={async (event) => {
              stores.tenantStore.setCurrentTenantId(Number(event.target.value));
              stores.userFileStore.clearUserFiles();
              stores.approvalRequestStore.clearApprovalRequests();
              stores.approvalRequestTaskStore.clearTasks();
              stores.tenantUserStore.clear();
              await stores.userFileStore.loadUserFiles();
              await stores.approvalRequestStore.loadApprovalRequests();
              await stores.approvalRequestTaskStore.loadNumberOfUncompletedTasks();
              if (location.pathname === "/inbox") {
                await stores.approvalRequestTaskStore.loadIncomingTasks();
              }
            }}
            sx={TENANT_PICKER_SX}
          >
            {stores.tenantStore.tenants.map((tenant) => (
              <MenuItem key={tenant.id} value={tenant.id}>
                {tenant.businessName}
              </MenuItem>
            ))}
          </Select>
        )}
        {!currentUser ? (
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => navigate("/signIn")}
          >
            Sign in
          </Button>
        ) : (
          <>
            <IconButton
              color="inherit"
              aria-label="Notifications"
              onClick={(event) => setNotificationAnchor(event.currentTarget)}
            >
              <Badge badgeContent={numberOfUncompletedTasks} color="error">
                <Notifications />
              </Badge>
            </IconButton>
            <Popover
              open={Boolean(notificationAnchor)}
              anchorEl={notificationAnchor}
              onClose={() => setNotificationAnchor(null)}
              anchorOrigin={NOTIFICATION_POPOVER_ANCHOR_ORIGIN}
              transformOrigin={NOTIFICATION_POPOVER_TRANSFORM_ORIGIN}
            >
              <Typography sx={NOTIFICATION_POPOVER_TEXT_SX}>
                {numberOfUncompletedTasks === 1
                  ? "You have 1 incoming request that needs to be reviewed."
                  : `You have ${numberOfUncompletedTasks} incoming requests that need to be reviewed.`}
              </Typography>
            </Popover>
            <IconButton
              color="inherit"
              aria-label="Open profile"
              onClick={() =>
                stores.commonStore.setProfileDrawerIsOpen(true)
              }
            >
              <AccountCircle />
            </IconButton>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default observer(MainAppBar);
