import AppRouter from "@/app/AppRouter";
import { stores } from "@/app/rootStore";
import PasskeyEnrollmentDialog from "@/features/identity/components/PasskeyEnrollmentDialog";
import { useSharedSessionSynchronization } from "@/features/identity/hooks/useSharedSessionSynchronization";
import AnalyticsBanner from "@/shared/analytics/AnalyticsBanner";
import LoadingOverlay from "@/shared/components/overlays/LoadingOverlay";
import Notifications from "@/shared/components/overlays/Notifications";
import { useAppVersionCheck } from "@/shared/hooks/useAppVersionCheck";
import { useSharedColorModeSynchronization } from "@/shared/hooks/useSharedColorModeSynchronization";
import "@fontsource/sora/400.css";
import "@fontsource/sora/500.css";
import "@fontsource/sora/600.css";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";

const App = () => {
  useAppVersionCheck();
  useSharedSessionSynchronization();
  useSharedColorModeSynchronization();

  useEffect(() => {
    const load = async () => {
      await stores.applicationConfigurationStore.load();
      await stores.userAccountStore.signInWithCachedToken();
    };
    load();
  }, []);

  return (
    <ThemeProvider theme={stores.userPreferencesStore.theme}>
      <CssBaseline>
        <AnalyticsBanner measurementId={import.meta.env.GOOGLE_ANALYTICS_ID} />
        {stores.userAccountStore.currentUser === undefined ||
        stores.applicationConfigurationStore.applicationConfiguration === null ? (
          <LoadingOverlay />
        ) : (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <AppRouter />
            <Notifications />
            <PasskeyEnrollmentDialog />
          </LocalizationProvider>
        )}
      </CssBaseline>
    </ThemeProvider>
  );
};

export default observer(App);
