import { stores } from "@/app/rootStore";
import { Menus, Routes, Shell, Tasks } from "@/shared/constants/constants";
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

const baseUrl = import.meta.env.BASE_URL.endsWith("/")
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`;
const logoSrc = `${baseUrl}logo.svg`;

const authRoutePaths = new Set([
  "/confirmEmail",
  "/forgotPassword",
  "/resendConfirmationEmail",
  "/resetPassword",
  "/signIn",
  "/signUp",
]);

const MainAppBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [notificationAnchor, setNotificationAnchor] =
    useState<HTMLElement | null>(null);
  const currentUser = stores.userAccountStore.currentUser;
  const mainMenuDrawerIsOpen = stores.commonStore.mainMenuDrawerIsOpen;
  const profileDrawerIsOpen = stores.commonStore.profileDrawerIsOpen;
  const mainMenuDrawerIsVisible = Boolean(currentUser) && mainMenuDrawerIsOpen;
  const tenantPickerIsVisible =
    stores.productStore.tenantsAreEnabled &&
    Boolean(currentUser) &&
    stores.tenantStore.tenants.length > 0;
  const tenantScopeIsReady =
    !stores.productStore.tenantsAreEnabled ||
    (stores.tenantStore.hasLoaded &&
      stores.tenantStore.currentTenantId !== null);
  const signInButtonIsVisible =
    !currentUser && !authRoutePaths.has(location.pathname);
  const numberOfUncompletedTasks =
    stores.approvalRequestTaskStore.numberOfUncompletedTasks;

  useEffect(() => {
    if (!currentUser || !tenantScopeIsReady) {
      return;
    }

    stores.approvalRequestTaskStore.loadUncompletedCount();
    if (Tasks.uncompletedRefreshMs <= 0) {
      return;
    }

    const intervalId = window.setInterval(() => {
      stores.approvalRequestTaskStore.loadUncompletedCount();
    }, Tasks.uncompletedRefreshMs);
    return () => window.clearInterval(intervalId);
  }, [currentUser, tenantScopeIsReady]);

  return (
    <AppBar
      position="fixed"
      color="transparent"
      elevation={0}
      sx={Shell.appBarSx(mainMenuDrawerIsVisible, profileDrawerIsOpen)}
    >
      <Toolbar disableGutters sx={Shell.appBarToolbarSx}>
        {currentUser && (
          <IconButton
            color="inherit"
            edge="start"
            aria-label={mainMenuDrawerIsOpen ? "Close menu" : "Open menu"}
            onClick={() =>
              stores.commonStore.setMainMenuDrawerIsOpen(!mainMenuDrawerIsOpen)
            }
            sx={Shell.mainMenuButtonSx(mainMenuDrawerIsOpen)}
          >
            <Menu />
          </IconButton>
        )}
        <Box sx={Shell.appBarBrandContainerSx}>
          <Link
            component="button"
            variant="body2"
            sx={Shell.appBarBrandLinkSx}
            onClick={() => {
              navigate(currentUser ? Routes.defaultPath : "/");
            }}
          >
            <Box
              component="img"
              src={logoSrc}
              alt=""
              aria-hidden="true"
              sx={Shell.appBarLogoSx}
            />
            <Typography variant="h6" sx={Shell.appBarBrandTitleSx}>
              Click2Approve
            </Typography>
          </Link>
        </Box>
        {tenantPickerIsVisible && (
          <Select
            size="small"
            value={stores.tenantStore.currentTenantId ?? ""}
            onChange={async (event) => {
              await stores.switchTenant(
                Number(event.target.value),
                location.pathname === "/inbox",
              );
            }}
            sx={Shell.tenantPickerSx}
          >
            {stores.tenantStore.tenants.map((tenant) => (
              <MenuItem key={tenant.id} value={tenant.id}>
                {tenant.businessName}
              </MenuItem>
            ))}
          </Select>
        )}
        {signInButtonIsVisible ? (
          <Button
            variant="outlined"
            onClick={() => navigate("/signIn")}
          >
            Sign in
          </Button>
        ) : currentUser ? (
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
              anchorOrigin={Menus.notificationPopoverAnchorOrigin}
              transformOrigin={Menus.notificationPopoverTransformOrigin}
            >
              <Typography sx={Shell.notificationPopoverTextSx}>
                {numberOfUncompletedTasks === 1
                  ? "You have 1 incoming request that needs to be reviewed."
                  : `You have ${numberOfUncompletedTasks} incoming requests that need to be reviewed.`}
              </Typography>
            </Popover>
            <IconButton
              color="inherit"
              aria-label="Open profile"
              onClick={() => stores.commonStore.setProfileDrawerIsOpen(true)}
            >
              <AccountCircle />
            </IconButton>
          </>
        ) : null}
      </Toolbar>
    </AppBar>
  );
};

export default observer(MainAppBar);
