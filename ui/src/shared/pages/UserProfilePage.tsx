import { stores } from "@/app/rootStore";
import { getPublicApiUrl } from "@/shared/api/userProfilesApi";
import LoadingOverlay from "@/shared/components/overlays/LoadingOverlay";
import { AuthForms, Dialogs, Files, Flex, Pages, StackSpacing } from "@/shared/constants/constants";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import {
  NotificationChannel,
  NotificationType,
  UserNotificationPreference,
} from "@/shared/models/userProfile";
import { AddAPhoto, DeleteOutline, Person } from "@mui/icons-material";
import type { SxProps } from "@mui/material";
import {
  Avatar,
  Box,
  Button,
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
import React, { ChangeEvent, useEffect, useRef, useState } from "react";

const AVATAR_PICKER_SIZE = 96;

const notificationLabels: Record<NotificationType, string> = {
  [NotificationType.ApprovalRequestTaskCreated]: "New approval request task",
  [NotificationType.ApprovalRequestCancelled]: "Approval request cancelled",
  [NotificationType.ApprovalRequestReviewed]: "Approval request reviewed",
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
  const [defaultTenantId, setDefaultTenantId] = useState<number | "">("");
  const [notificationPreferences, setNotificationPreferences] = useState<
    UserNotificationPreference[]
  >([]);
  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState<string>();
  const [selectedTab, setSelectedTab] = useState("profile");

  useEffect(() => {
    if (!stores.userProfileStore.hasLoaded) {
      stores.userProfileStore.load();
    }
  }, []);

  useEffect(() => {
    setFirstName(profile?.firstName ?? "");
    setLastName(profile?.lastName ?? "");
    setDefaultTenantId(profile?.defaultTenantId ?? "");
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

  const handleColorModeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    stores.userPreferencesStore.setColorMode(
      event.target.checked ? "dark" : "light"
    );
  };

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
    const saved = await stores.userProfileStore.update({
      firstName: firstName.trim() || undefined,
      lastName: lastName.trim() || undefined,
      defaultTenantId: defaultTenantId === "" ? undefined : defaultTenantId,
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
  };

  const handleRemoveAvatar = async () => {
    setSelectedAvatar(null);
    await stores.userProfileStore.deleteAvatar();
  };

  const avatarUrl = selectedAvatarUrl ?? getPublicApiUrl(profile.avatar);

  return (
    <Box sx={Pages.userProfileContainerSx}>
      <Typography component="h1" variant="h5">
        User profile
      </Typography>
      <Stack component="form" noValidate spacing={StackSpacing.loose} sx={AuthForms.formSx}>
        <Tabs
          value={selectedTab}
          onChange={(_, value: string) => setSelectedTab(value)}
          variant="scrollable"
        >
          <Tab label="Profile" value="profile" />
          <Tab label="Notifications" value="notifications" />
          <Tab label="Display" value="display" />
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
                        disabled={!profile.avatar && !selectedAvatar}
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
                  value={defaultTenantId}
                  onChange={(event) =>
                    setDefaultTenantId(
                      event.target.value === "" ? "" : Number(event.target.value)
                    )
                  }
                >
                  <MenuItem value="">No default organization</MenuItem>
                  {stores.tenantStore.tenants.map((tenant) => (
                    <MenuItem key={tenant.id} value={tenant.id}>
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
        {selectedTab === "display" && (
          <Stack spacing={Dialogs.formStackSpacing} sx={Dialogs.tabContentSx}>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={stores.userPreferencesStore.theme.palette.mode === "dark"}
                    onChange={handleColorModeChange}
                  />
                }
                label="Dark mode"
              />
            </FormGroup>
          </Stack>
        )}
        <Box>
          <Button variant="outlined" onClick={handleSave}>
            Save
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};

export default observer(UserProfilePage);
