import { AccountCircle, Menu, Notifications } from "@mui/icons-material";
import {
  AppBar,
  Box,
  Button,
  IconButton,
  Link,
  MenuItem,
  Select,
  Toolbar,
  Typography,
} from "@mui/material";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import { DEFAULT_PATH } from "../../data/constants";
import { stores } from "../../stores/stores";
import { MAIN_MENU_DRAWER_WIDTH } from "../drawers/MainMenuDrawer";

const baseUrl = import.meta.env.BASE_URL.endsWith("/")
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`;
const logoSrc = `${baseUrl}logo.svg`;

const MainAppBar = () => {
  const navigate = useNavigate();
  const mainMenuDrawerIsOpen = stores.commonStore.mainMenuDrawerIsOpen;
  const profileDrawerIsOpen = stores.commonStore.profileDrawerIsOpen;
  const mainMenuDrawerIsVisible =
    Boolean(stores.userAccountStore.currentUser) && mainMenuDrawerIsOpen;
  const tenantPickerIsVisible =
    stores.productStore.tenantsAreEnabled &&
    Boolean(stores.userAccountStore.currentUser) &&
    stores.tenantStore.tenants.length > 0;

  return (
    <AppBar
      position="fixed"
      color="transparent"
      elevation={0}
      sx={{
        bgcolor: "background.default",
        borderBottom: 1,
        borderColor: "divider",
        ml: {
          md: mainMenuDrawerIsVisible ? `${MAIN_MENU_DRAWER_WIDTH}px` : 0,
        },
        width: {
          md: mainMenuDrawerIsVisible
            ? `calc(100% - ${MAIN_MENU_DRAWER_WIDTH}px)`
            : "100%",
        },
        zIndex: (theme) =>
          profileDrawerIsOpen
            ? theme.zIndex.drawer - 1
            : theme.zIndex.drawer + 1,
        transition: (theme) =>
          theme.transitions.create(["margin", "width"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
      }}
    >
      <Toolbar disableGutters sx={{ minHeight: 64, pl: 2, pr: 2 }}>
        {stores.userAccountStore.currentUser && (
          <IconButton
            color="inherit"
            edge="start"
            aria-label={mainMenuDrawerIsOpen ? "Close menu" : "Open menu"}
            onClick={() =>
              stores.commonStore.setMainMenuDrawerIsOpen(!mainMenuDrawerIsOpen)
            }
            sx={{
              mr: 1,
              display: mainMenuDrawerIsOpen ? "none" : "inline-flex",
            }}
          >
            <Menu />
          </IconButton>
        )}
        <Box sx={{ flex: "1 1 auto", minWidth: 0, overflow: "hidden" }}>
          <Link
            component="button"
            variant="body2"
            sx={{
              display: "flex",
              alignItems: "center",
              color: "inherit",
              maxWidth: "100%",
              minWidth: 0,
              textDecoration: "none",
              width: "fit-content",
            }}
            onClick={() => {
              navigate(
                stores.userAccountStore.currentUser ? DEFAULT_PATH : "/"
              );
            }}
          >
            <Box
              component="img"
              src={logoSrc}
              alt=""
              aria-hidden="true"
              sx={{
                display: "block",
                flexShrink: 0,
                width: 36,
                height: 36,
                mr: 0.5,
              }}
            />
            <Typography
              variant="h6"
              sx={{
                color: "inherit",
                overflow: "hidden",
                textDecoration: "none",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              click2approve
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
              await stores.approvalRequestTaskStore.loadTasks(
                stores.commonStore.currentTab
              );
            }}
            sx={{
              flex: "0 1 auto",
              maxWidth: { xs: 140, sm: 220 },
              minWidth: 0,
              mr: 1,
              width: { xs: "30vw", sm: 220 },
              "& .MuiSelect-select": {
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              },
            }}
          >
            {stores.tenantStore.tenants.map((tenant) => (
              <MenuItem key={tenant.id} value={tenant.id}>
                {tenant.businessName}
              </MenuItem>
            ))}
          </Select>
        )}
        {!stores.userAccountStore.currentUser ? (
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => navigate("/signIn")}
          >
            Sign in
          </Button>
        ) : (
          <>
            <IconButton color="inherit" aria-label="Notifications">
              <Notifications />
            </IconButton>
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
