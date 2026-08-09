import { stores } from "@/app/rootStore";
import { getPublicApiUrl } from "@/shared/api/userProfilesApi";
import ColorModeSwitch from "@/shared/components/layout/ColorModeSwitch";
import PublicAppBar from "@/shared/components/layout/PublicAppBar";
import TenantPickerOption from "@/features/tenants/components/TenantPickerOption";
import { Routes, Shell } from "@/shared/constants/constants";
import { AppBarOptions } from "@/shared/models/appBarOptions";
import { getEmailInitials } from "@/shared/utils/email";
import { Menu } from "@mui/icons-material";
import {
  Avatar,
  IconButton,
  MenuItem,
  Select,
} from "@mui/material";
import { observer } from "mobx-react-lite";
import { useLocation, useNavigate } from "react-router-dom";

const MainAppBar = ({
  showMainMenuButton = true,
  showProfileButton = true,
  showTenantPicker = true,
}: AppBarOptions) => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = stores.userAccountStore.currentUser;
  const profile = stores.userProfileStore.profile;
  const mainMenuDrawerIsOpen = stores.commonStore.mainMenuDrawerIsOpen;
  const profileDrawerIsOpen = stores.commonStore.profileDrawerIsOpen;
  const mainMenuDrawerIsVisible =
    Boolean(currentUser) && showMainMenuButton && mainMenuDrawerIsOpen;
  const tenantPickerIsVisible =
    showTenantPicker &&
    stores.applicationConfigurationStore.tenantsAreEnabled &&
    Boolean(currentUser) &&
    stores.tenantStore.tenants.length > 0;
  const currentTenantGlobalId = stores.tenantStore.currentTenantGlobalId;
  const tenantPickerOptions = stores.tenantStore.tenants.flatMap((tenant) => {
    if (!tenant.delegators?.length) {
      return [{ employeeDisplayName: undefined, employeeGlobalId: null, tenant }];
    }
    return [
      { employeeDisplayName: tenant.currentEmployeeDisplayName, employeeGlobalId: tenant.currentEmployeeGlobalId ?? null, tenant },
      ...tenant.delegators.map((delegator) => ({
        employeeDisplayName: delegator.displayName,
        employeeGlobalId: delegator.employeeGlobalId,
        tenant,
      })),
    ];
  });
  const selectedTenantPickerOption = tenantPickerOptions.find((option) =>
    option.tenant.globalId === currentTenantGlobalId &&
    option.employeeGlobalId === stores.tenantStore.currentWorkEmployeeGlobalId,
  ) ?? tenantPickerOptions.find((option) => option.tenant.globalId === currentTenantGlobalId);
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
        currentUser && showMainMenuButton && (
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
          value={selectedTenantPickerOption
            ? `${selectedTenantPickerOption.tenant.globalId}:${selectedTenantPickerOption.employeeGlobalId ?? ""}`
            : ""}
          renderValue={() => selectedTenantPickerOption && (
            <TenantPickerOption
              employeeDisplayName={selectedTenantPickerOption.employeeDisplayName}
              tenant={selectedTenantPickerOption.tenant}
            />
          )}
          onChange={async (event) => {
            const option = tenantPickerOptions.find((candidate) =>
              `${candidate.tenant.globalId}:${candidate.employeeGlobalId ?? ""}` === event.target.value,
            );
            if (!option) return;
            const tenantGlobalId = option.tenant.globalId;
            await stores.switchTenant(tenantGlobalId, option.employeeGlobalId, location.pathname === inboxPath);
            navigate(Routes.tenantPath(tenantGlobalId, Routes.inboxPath));
          }}
          sx={Shell.tenantPickerSx}
        >
          {tenantPickerOptions.map((option) => (
            <MenuItem
              key={`${option.tenant.globalId}:${option.employeeGlobalId ?? ""}`}
              value={`${option.tenant.globalId}:${option.employeeGlobalId ?? ""}`}
            >
              <TenantPickerOption employeeDisplayName={option.employeeDisplayName} tenant={option.tenant} />
            </MenuItem>
          ))}
        </Select>
      )}
      <ColorModeSwitch
        checked={stores.userPreferencesStore.theme.palette.mode === "dark"}
        inputProps={{ "aria-label": "Dark mode" }}
        onChange={(event) =>
          stores.userPreferencesStore.setColorMode(
            event.target.checked ? "dark" : "light"
          )
        }
      />
      {currentUser && showProfileButton && (
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
