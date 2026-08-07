import { stores } from "@/app/rootStore";
import { getPublicApiUrl } from "@/shared/api/userProfilesApi";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import LoadingOverlay from "@/shared/components/overlays/LoadingOverlay";
import { AuthForms, Dialogs, Files, Flex, Pages, StackSpacing } from "@/shared/constants/constants";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import {
  NotificationChannel,
  NotificationType,
  UserNotificationPreference,
} from "@/shared/models/userProfile";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
import {
  PersistenceSuccessMessages,
  showPersistenceSuccessToast,
} from "@/shared/utils/toasts";
import { AddAPhoto, DeleteOutline, Person } from "@mui/icons-material";
import LoadingButton from "@mui/lab/LoadingButton";
import type { SxProps } from "@mui/material";
import {
  Avatar,
  Box,
  FormControl,
  FormControlLabel,
  FormGroup,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { observer } from "mobx-react-lite";
import { ChangeEvent, useEffect, useRef, useState } from "react";

const AVATAR_PICKER_SIZE = 96;

const notificationLabels: Record<NotificationType, string> = {
  [NotificationType.ApprovalRequestTaskCreated]: "New  request task",
  [NotificationType.ApprovalRequestCancelled]: "Request cancelled",
  [NotificationType.ApprovalRequestReviewed]: "Request reviewed",
};

const avatarPickerContainerSx: SxProps<Theme> = {
  position: "relative",
  width: AVATAR_PICKER_SIZE,
};

const avatarPickerSx: SxProps<Theme> = {
  bgcolor: "action.selected",
  color: "text.secondary",
  height: AVATAR_PICKER_SIZE,
  width: AVATAR_PICKER_SIZE,
};

const avatarPickerChangeButtonSx: SxProps<Theme> = {
  bgcolor: "background.paper",
  border: 1,
  borderColor: "divider",
  bottom: 0,
  boxShadow: 1,
  position: "absolute",
  right: 0,
  "&:hover": {
    bgcolor: "background.paper",
  },
};

const UserProfilePage = () => {
  usePageTitle("User profile");
  const fileInput = useRef<HTMLInputElement>(null);
  const profile = stores.userProfileStore.profile;
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [defaultTenantGlobalId, setDefaultTenantGlobalId] = useState<string | "">("");
  const [notificationPreferences, setNotificationPreferences] = useState<
    UserNotificationPreference[]
  >([]);
  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState<string>();
  const [selectedTab, setSelectedTab] = useState("profile");
  const removeAvatarAction = useAsyncAction(ActionLoaders.userProfile.removeAvatar());
  const saveAction = useAsyncAction(ActionLoaders.userProfile.save());

  useEffect(() => {
    if (!stores.userProfileStore.hasLoaded) {
      stores.userProfileStore.load();
    }
  }, []);

  useEffect(() => {
    setFirstName(profile?.firstName ?? "");
    setLastName(profile?.lastName ?? "");
    setDefaultTenantGlobalId(profile?.defaultTenantGlobalId ?? "");
    setNotificationPreferences(profile?.notificationPreferences ?? []);
  }, [profile]);

  useEffect(() => {
    if (!selectedAvatar) {
      setSelectedAvatarUrl(undefined);
      return undefined;
    }

    const objectUrl = URL.createObjectURL(selectedAvatar);
    setSelectedAvatarUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedAvatar]);

  if (!stores.userProfileStore.hasLoaded || !profile) {
    return <LoadingOverlay />;
  }

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0] ?? null;
    event.currentTarget.value = "";
    setSelectedAvatar(file);
  };

  const handleNotificationToggle = (type: NotificationType) => {
    setNotificationPreferences((current) =>
      current.map((preference) =>
        preference.type === type && preference.channel === NotificationChannel.Email
          ? { ...preference, isEnabled: !preference.isEnabled }
          : preference
      )
    );
  };

  const handleSave = async () => {
    await saveAction.run(async () => {
      const saved = await stores.userProfileStore.update({
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        defaultTenantGlobalId: defaultTenantGlobalId === "" ? undefined : defaultTenantGlobalId,
        notificationPreferences,
      });
      if (!saved) {
        return;
      }

      if (selectedAvatar) {
        const uploaded = await stores.userProfileStore.uploadAvatar(selectedAvatar);
        if (!uploaded) {
          return;
        }
        setSelectedAvatar(null);
      }
      showPersistenceSuccessToast(PersistenceSuccessMessages.profileSaved);
    });
  };

  const handleRemoveAvatar = async () => {
    await removeAvatarAction.run(async () => {
      setSelectedAvatar(null);
      const deleted = await stores.userProfileStore.deleteAvatar();
      if (deleted) {
        showPersistenceSuccessToast(PersistenceSuccessMessages.profileSaved);
      }
    });
  };

  const avatarUrl = selectedAvatarUrl ?? getPublicApiUrl(profile.avatar);

  return (
    <Box sx={Pages.userProfileContainerSx}>
      <PageBreadcrumbs items={[{ label: "User profile" }]} />
      <Stack component="form" noValidate spacing={StackSpacing.loose} sx={AuthForms.formSx}>
        <Tabs
          value={selectedTab}
          onChange={(_, value: string) => setSelectedTab(value)}
          variant="scrollable"
        >
          <Tab label="Profile" value="profile" />
          <Tab label="Notifications" value="notifications" />
        </Tabs>
        {selectedTab === "profile" && (
          <Stack spacing={Dialogs.formStackSpacing} sx={Dialogs.tabContentSx}>
            <Stack direction="row" spacing={StackSpacing.loose} alignItems="center">
              <Box sx={avatarPickerContainerSx}>
                <Avatar src={avatarUrl} alt="User avatar" sx={avatarPickerSx}>
                  <Person fontSize="large" />
                </Avatar>
                <Tooltip title="Change avatar">
                  <IconButton
                    aria-label="Change avatar"
                    size="small"
                    onClick={() => fileInput.current?.click()}
                    sx={avatarPickerChangeButtonSx}
                  >
                    <AddAPhoto fontSize="small" />
                  </IconButton>
                </Tooltip>
                <input
                  accept="image/*"
                  onChange={handleAvatarChange}
                  ref={fileInput}
                  style={Files.inputStyle}
                  type="file"
                />
              </Box>
              <Stack spacing={StackSpacing.tight} sx={Flex.minWidthZeroSx}>
                <Typography variant="subtitle2">Avatar</Typography>
                <Box>
                  <Tooltip title="Remove avatar">
                    <span>
                      <IconButton
                        aria-label="Remove avatar"
                        disabled={removeAvatarAction.isRunning || (!profile.avatar && !selectedAvatar)}
                        onClick={handleRemoveAvatar}
                        size="small"
                      >
                        <DeleteOutline fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>
              </Stack>
            </Stack>
            <TextField
              label="First name"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
            />
            <TextField
              label="Last name"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
            />
            {stores.tenantStore.tenants.length > 0 && (
              <FormControl>
                <InputLabel id="default-organization-label">
                  Default organization
                </InputLabel>
                <Select
                  labelId="default-organization-label"
                  label="Default organization"
                  value={defaultTenantGlobalId}
                  onChange={(event) =>
                    setDefaultTenantGlobalId(
                      event.target.value === "" ? "" : event.target.value
                    )
                  }
                >
                  <MenuItem value="">No default organization</MenuItem>
                  {stores.tenantStore.tenants.map((tenant) => (
                    <MenuItem key={tenant.globalId} value={tenant.globalId}>
                      {tenant.businessName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Stack>
        )}
        {selectedTab === "notifications" && (
          <Stack spacing={Dialogs.formStackSpacing} sx={Dialogs.tabContentSx}>
            <FormGroup>
              {notificationPreferences.map((preference) => (
                <FormControlLabel
                  key={`${preference.channel}-${preference.type}`}
                  control={
                    <Switch
                      checked={preference.isEnabled}
                      onChange={() => handleNotificationToggle(preference.type)}
                    />
                  }
                  label={notificationLabels[preference.type]}
                />
              ))}
            </FormGroup>
          </Stack>
        )}
        <Box>
          <LoadingButton loading={saveAction.isRunning} variant="outlined" onClick={handleSave}>
            Save
          </LoadingButton>
        </Box>
      </Stack>
    </Box>
  );
};

export default observer(UserProfilePage);
