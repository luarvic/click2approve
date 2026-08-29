import { stores } from "@/app/rootStore";
import ApprovalRequestSignatureField from "@/features/approvalRequests/components/ApprovalRequestSignatureField";
import { getPublicApiUrl } from "@/shared/api/userProfilesApi";
import ImagePicker from "@/shared/components/images/ImagePicker";
import NarrowContent from "@/shared/components/layout/NarrowContent";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import MainActionButton from "@/shared/components/buttons/MainActionButton";
import HelpPopover from "@/shared/components/overlays/HelpPopover";
import { AuthForms, Dialogs, Pages, StackSpacing } from "@/shared/constants/constants";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import {
  NotificationChannel,
  NotificationPreferenceType,
  notificationChannelLabels,
  notificationPreferenceTypeLabels,
  notificationPreferenceTypeToNotificationTypes,
} from "@/shared/models/notifications";
import { UserNotificationPreference } from "@/shared/models/userProfile";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
import {
  PersistenceSuccessMessages,
  showPersistenceSuccessNotification,
} from "@/shared/utils/persistenceNotifications";
import { Person } from "@mui/icons-material";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { observer } from "mobx-react-lite";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const notificationChannels = [NotificationChannel.InApp, NotificationChannel.Email];

const notificationPreferenceTypes = [
  NotificationPreferenceType.Requests,
  NotificationPreferenceType.Tasks,
  NotificationPreferenceType.Chat,
];

const UserProfilePage = () => {
  usePageTitle("User profile");
  const navigate = useNavigate();
  const profile = stores.userProfileStore.profile;
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [defaultTenantGlobalId, setDefaultTenantGlobalId] = useState<string | "">("");
  const [defaultSignatureJson, setDefaultSignatureJson] = useState("");
  const [notificationPreferences, setNotificationPreferences] = useState<UserNotificationPreference[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);
  const [selectedTab, setSelectedTab] = useState("profile");
  const removeAvatarAction = useAsyncAction(ActionLoaders.userProfile.removeAvatar());
  const saveAction = useAsyncAction(ActionLoaders.userProfile.save());

  const handleSignatureChange = useCallback((value: string) => {
    setDefaultSignatureJson(value);
  }, []);

  useEffect(() => {
    if (!stores.userProfileStore.hasLoaded) {
      const loader = ActionLoaders.pages.userProfile();
      stores.commonStore.updateActionLoadingCounter(loader, 1);
      void stores.userProfileStore.load().finally(() => stores.commonStore.updateActionLoadingCounter(loader, -1));
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
    return null;
  }

  const isNotificationCategoryEnabled = (type: NotificationPreferenceType, channel: NotificationChannel) => {
    const notificationTypes = notificationPreferenceTypeToNotificationTypes[type];
    return notificationTypes.every(
      (type) =>
        notificationPreferences.find((preference) => preference.type === type && preference.channel === channel)
          ?.isEnabled ?? true,
    );
  };

  const handleNotificationToggle = (type: NotificationPreferenceType, channel: NotificationChannel) => {
    const notificationTypes = notificationPreferenceTypeToNotificationTypes[type];
    const isEnabled = isNotificationCategoryEnabled(type, channel);
    setNotificationPreferences((current) =>
      current.map((preference) =>
        notificationTypes.includes(preference.type) && preference.channel === channel
          ? { ...preference, isEnabled: !isEnabled }
          : preference,
      ),
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
      showPersistenceSuccessNotification(PersistenceSuccessMessages.profileSaved);
    });
  };

  const handleRemoveAvatar = async () => {
    await removeAvatarAction.run(async () => {
      setSelectedAvatar(null);
      const deleted = await stores.userProfileStore.deleteAvatar();
      if (deleted) {
        showPersistenceSuccessNotification(PersistenceSuccessMessages.profileSaved);
      }
    });
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <Box sx={Pages.userProfileContainerSx}>
      <PageBreadcrumbs
        items={[
          {
            label: "User profile",
            titleAction: <HelpPopover helpText="Update your profile, signature, and notification preferences." />,
          },
        ]}
      />
      <NarrowContent>
        <Stack component="form" noValidate spacing={StackSpacing.loose} sx={AuthForms.formSx}>
          <Tabs value={selectedTab} onChange={(_, value: string) => setSelectedTab(value)} variant="scrollable">
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
              <TextField label="First name" value={firstName} onChange={(event) => setFirstName(event.target.value)} />
              <TextField label="Last name" value={lastName} onChange={(event) => setLastName(event.target.value)} />
              {stores.tenantStore.tenants.length > 0 && (
                <FormControl>
                  <InputLabel id="default-organization-label">Default organization</InputLabel>
                  <Select
                    labelId="default-organization-label"
                    label="Default organization"
                    value={defaultTenantGlobalId}
                    onChange={(event) => setDefaultTenantGlobalId(event.target.value === "" ? "" : event.target.value)}
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
              <Table aria-label="Notification preferences">
                <TableHead>
                  <TableRow>
                    <TableCell />
                    {notificationChannels.map((channel) => (
                      <TableCell key={channel} align="center">
                        {notificationChannelLabels[channel]}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {notificationPreferenceTypes.map((type) => (
                    <TableRow key={type}>
                      <TableCell component="th" scope="row">
                        {notificationPreferenceTypeLabels[type]}
                      </TableCell>
                      {notificationChannels.map((channel) => (
                        <TableCell key={channel} align="center">
                          <Switch
                            checked={isNotificationCategoryEnabled(type, channel)}
                            inputProps={{
                              "aria-label": `${notificationPreferenceTypeLabels[type]} ${notificationChannelLabels[channel]}`,
                            }}
                            onChange={() => handleNotificationToggle(type, channel)}
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Stack>
          )}
          {selectedTab === "signature" && (
            <Stack spacing={Dialogs.formStackSpacing} sx={Dialogs.tabContentSx}>
              <Typography color="text.secondary">
                Your saved signature will be prefilled when you sign an approval request.
              </Typography>
              <ApprovalRequestSignatureField onChange={handleSignatureChange} value={defaultSignatureJson} />
            </Stack>
          )}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={Dialogs.stepHeaderSpacing}
            sx={Dialogs.addStepButtonSx}
          >
            <Button type="button" variant="outlined" onClick={handleCancel}>
              Cancel
            </Button>
            <MainActionButton loading={saveAction.isRunning} onClick={handleSave}>
              Save
            </MainActionButton>
          </Stack>
        </Stack>
      </NarrowContent>
    </Box>
  );
};

export default observer(UserProfilePage);
