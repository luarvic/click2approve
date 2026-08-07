import { stores } from "@/app/rootStore";
import { getPublicApiUrl } from "@/shared/api/userProfilesApi";
import ColorModeSwitch from "@/shared/components/layout/ColorModeSwitch";
import PublicAppBar from "@/shared/components/layout/PublicAppBar";
import { Routes, Shell } from "@/shared/constants/constants";
import { getEmailInitials } from "@/shared/utils/helpers";
import { Menu } from "@mui/icons-material";
import {
  Avatar,
  IconButton,
  MenuItem,
  Select,
} from "@mui/material";
import { observer } from "mobx-react-lite";
import { useLocation, useNavigate } from "react-router-dom";

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
  const currentTenantGlobalId = stores.tenantStore.currentTenantGlobalId;
  const inboxPath = currentTenantGlobalId
    ? Routes.tenantPath(currentTenantGlobalId, Routes.inboxPath)
    : "/";
  return (
    <PublicAppBar
      homePath={currentUser ? inboxPath : Routes.defaultPath}
      mainMenuDrawerIsVisible={mainMenuDrawerIsVisible}
      profileDrawerIsOpen={profileDrawerIsOpen}
      showBrandTitle
      startContent={
        currentUser && (
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
        )
      }
    >
      {tenantPickerIsVisible && (
        <Select
          size="small"
          value={stores.tenantStore.currentTenantGlobalId ?? ""}
          onChange={async (event) => {
            const tenantGlobalId = event.target.value;
            await stores.switchTenant(tenantGlobalId, location.pathname === inboxPath);
            navigate(Routes.tenantPath(tenantGlobalId, Routes.inboxPath));
          }}
          sx={Shell.tenantPickerSx}
        >
          {stores.tenantStore.tenants.map((tenant) => (
            <MenuItem key={tenant.globalId} value={tenant.globalId}>
              {tenant.businessName}
            </MenuItem>
          ))}
        </Select>
      )}
      {currentUser && (
        <ColorModeSwitch
          checked={stores.userPreferencesStore.theme.palette.mode === "dark"}
          inputProps={{ "aria-label": "Dark mode" }}
          onChange={(event) =>
            stores.userPreferencesStore.setColorMode(
              event.target.checked ? "dark" : "light"
            )
          }
        />
      )}
      {currentUser && (
        <IconButton
          color="inherit"
          edge="end"
          aria-label="Open profile"
          onClick={() => stores.commonStore.setProfileDrawerIsOpen(true)}
        >
          <Avatar src={getPublicApiUrl(profile?.avatar)} sx={Shell.profileAvatarSx}>
            {getEmailInitials(currentUser.email)}
          </Avatar>
        </IconButton>
      )}
    </PublicAppBar>
  );
};

export default observer(MainAppBar);
