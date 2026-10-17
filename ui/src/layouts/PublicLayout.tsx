import { stores } from "@/app/rootStore";
import ColorModeSwitch from "@/shared/components/layout/ColorModeSwitch";
import PublicAppBar from "@/shared/components/layout/PublicAppBar";
import { Shell } from "@/shared/components/layout/shellStyles";
import { GlobalLoadingActionLoaderScopes } from "@/shared/utils/actionLoaders";
import { Box, Container, LinearProgress, Toolbar } from "@mui/material";
import { observer } from "mobx-react-lite";
import { ReactNode } from "react";
import { Outlet } from "react-router-dom";

interface PublicLayoutProps {
  children?: ReactNode;
}

const PublicLayout = ({ children }: PublicLayoutProps) => {
  const isLoading = stores.commonStore.isAnyActionLoading(GlobalLoadingActionLoaderScopes);
  return (
    <Box sx={Shell.outerBackgroundSx}>
      <PublicAppBar showBrandTitle>
        <ColorModeSwitch
          checked={stores.userPreferencesStore.theme.palette.mode === "dark"}
          slotProps={{ input: { "aria-label": "Dark mode" } }}
          onChange={(event) => stores.userPreferencesStore.setColorMode(event.target.checked ? "dark" : "light")}
        />
      </PublicAppBar>
      <Container maxWidth="xl" disableGutters sx={Shell.contentBackgroundSx}>
        <Box component="main">
          <Toolbar sx={Shell.appBarSpacerSx} />
          {isLoading && <LinearProgress sx={Shell.loadingProgressSx} />}
          {children ?? <Outlet />}
        </Box>
      </Container>
    </Box>
  );
};

export default observer(PublicLayout);
