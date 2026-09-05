import AppRouter from "@/app/AppRouter";
import { stores } from "@/app/rootStore";
import LoadingOverlay from "@/shared/components/overlays/LoadingOverlay";
import Notifications from "@/shared/components/overlays/Notifications";
import "@fontsource/sora/400.css";
import "@fontsource/sora/500.css";
import "@fontsource/sora/600.css";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";

const App = () => {
  useEffect(() => {
    const load = async () => {
      await stores.applicationConfigurationStore.load();
      await stores.userAccountStore.signInWithCachedToken();
    };
    load();
  }, []);

  return stores.userAccountStore.currentUser === undefined ||
    stores.applicationConfigurationStore.applicationConfiguration === null ? (
    <LoadingOverlay />
  ) : (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <ThemeProvider theme={stores.userPreferencesStore.theme}>
        <CssBaseline>
          <AppRouter />
          <Notifications />
        </CssBaseline>
      </ThemeProvider>
    </LocalizationProvider>
  );
};

export default observer(App);
