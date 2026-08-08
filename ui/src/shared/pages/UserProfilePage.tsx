import { stores } from "@/app/rootStore";
import ApprovalRequestSignatureField from "@/features/approvalRequests/components/ApprovalRequestSignatureField";
import { getPublicApiUrl } from "@/shared/api/userProfilesApi";
import ImagePicker from "@/shared/components/images/ImagePicker";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import LoadingOverlay from "@/shared/components/overlays/LoadingOverlay";
import { AuthForms, Dialogs, Pages, StackSpacing } from "@/shared/constants/constants";
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
import { Person } from "@mui/icons-material";
import LoadingButton from "@mui/lab/LoadingButton";
import {
  Box,
  FormControl,
  FormControlLabel,
  FormGroup,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useState } from "react";

const notificationLabels: Record<NotificationType, string> = {
  [NotificationType.ApprovalRequestTaskCreated]: "New  request task",
  [NotificationType.ApprovalRequestCancelled]: "Request cancelled",
  [NotificationType.ApprovalRequestReviewed]: "Request reviewed",
};

const UserProfilePage = () => {
  usePageTitle("User profile");
  const profile = stores.userProfileStore.profile;
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [defaultTenantGlobalId, setDefaultTenantGlobalId] = useState<string | "">("");
  const [defaultSignatureJson, setDefaultSignatureJson] = useState("");
  const [notificationPreferences, setNotificationPreferences] = useState<
    UserNotificationPreference[]
  >([]);
  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);
  const [selectedTab, setSelectedTab] = useState("profile");
  const removeAvatarAction = useAsyncAction(ActionLoaders.userProfile.removeAvatar());
  const saveAction = useAsyncAction(ActionLoaders.userProfile.save());

  const handleSignatureChange = useCallback((value: string) => {
    setDefaultSignatureJson(value);
  }, []);

  useEffect(() => {
    if (!stores.userProfileStore.hasLoaded) {
      stores.userProfileStore.load();
    }
  }, []);

  useEffect(() => {
    setFirstName(profile?.firstName ?? "");
    setLastName(profile?.lastName ?? "");
    setDefaultTenantGlobalId(profile?.defaultTenantGlobalId ?? "");
    setDefaultSignatureJson(profile?.defaultSignatureJson ?? "");
    setNotificationPreferences(profile?.notificationPreferences ?? []);
  }, [profile]);

  if (!stores.userProfileStore.hasLoaded || !profile) {
    return <LoadingOverlay />;
  }

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
        defaultSignatureJson: defaultSignatureJson || undefined,
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
          <Tab label="Signature" value="signature" />
          <Tab label="Notifications" value="notifications" />
        </Tabs>
        {selectedTab === "profile" && (
          <Stack spacing={Dialogs.formStackSpacing} sx={Dialogs.tabContentSx}>
            <ImagePicker
              alt="User avatar"
              fallback={<Person fontSize="large" />}
              imageSize={stores.applicationConfigurationStore.applicationConfiguration?.avatarImageSize ?? 256}
              imageUrl={getPublicApiUrl(profile.avatar)}
              onDelete={handleRemoveAvatar}
              onSave={setSelectedAvatar}
              selectedFile={selectedAvatar}
              title="Edit avatar"
            />
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
        {selectedTab === "signature" && (
          <Stack spacing={Dialogs.formStackSpacing} sx={Dialogs.tabContentSx}>
            <Typography color="text.secondary">
              Your saved signature will be prefilled when you sign an approval request.
            </Typography>
            <ApprovalRequestSignatureField
              onChange={handleSignatureChange}
              value={defaultSignatureJson}
            />
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
