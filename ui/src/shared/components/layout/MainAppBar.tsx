import { stores } from "@/app/rootStore";
import { getPublicApiUrl } from "@/shared/api/userProfileApi";
import { Routes, Shell } from "@/shared/constants/constants";
import { getEmailInitials } from "@/shared/utils/helpers";
import { Menu } from "@mui/icons-material";
import {
  AppBar,
  Avatar,
  Box,
  IconButton,
  Link,
  MenuItem,
  Select,
  Toolbar,
  Typography,
} from "@mui/material";
import { observer } from "mobx-react-lite";
import { useLocation, useNavigate } from "react-router-dom";

const baseUrl = import.meta.env.BASE_URL.endsWith("/")
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`;
const logoSrc = `${baseUrl}logo.svg`;

const MainAppBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = stores.userAccountStore.currentUser;
  const profile = stores.userProfileStore.profile;
  const mainMenuDrawerIsOpen = stores.commonStore.mainMenuDrawerIsOpen;
  const profileDrawerIsOpen = stores.commonStore.profileDrawerIsOpen;
  const mainMenuDrawerIsVisible = Boolean(currentUser) && mainMenuDrawerIsOpen;
  const tenantPickerIsVisible =
    stores.productStore.tenantsAreEnabled &&
    Boolean(currentUser) &&
    stores.tenantStore.tenants.length > 0;
  const currentTenantId = stores.tenantStore.currentTenantId;
  const inboxPath = currentTenantId
    ? Routes.tenantPath(currentTenantId, Routes.inboxPath)
    : "/";
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
              navigate(currentUser ? inboxPath : "/");
            }}
          >
            <Box
              component="img"
              src={logoSrc}
              alt=""
              aria-hidden="true"
              sx={Shell.appBarLogoSx}
            />
            <Typography
              variant="h6"
              sx={Shell.appBarBrandTitleSx(!currentUser)}
            >
              Click2Approve
            </Typography>
          </Link>
        </Box>
        {tenantPickerIsVisible && (
          <Select
            size="small"
            value={stores.tenantStore.currentTenantId ?? ""}
            onChange={async (event) => {
              const tenantId = Number(event.target.value);
              await stores.switchTenant(tenantId, location.pathname === inboxPath);
              navigate(Routes.tenantPath(tenantId, Routes.inboxPath));
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
        {currentUser && (
          <>
            <IconButton
              color="inherit"
              aria-label="Open profile"
              onClick={() => stores.commonStore.setProfileDrawerIsOpen(true)}
            >
              <Avatar
                src={getPublicApiUrl(profile?.avatar)}
                sx={Shell.profileAvatarSx}
              >
                {getEmailInitials(currentUser.email)}
              </Avatar>
            </IconButton>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default observer(MainAppBar);
