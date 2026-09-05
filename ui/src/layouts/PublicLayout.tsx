import { stores } from "@/app/rootStore";
import ColorModeSwitch from "@/shared/components/layout/ColorModeSwitch";
import PublicAppBar from "@/shared/components/layout/PublicAppBar";
import { Shell } from "@/shared/components/layout/shellStyles";
import { Box, Container, Toolbar } from "@mui/material";
import { ReactNode } from "react";
import { Outlet } from "react-router-dom";

interface PublicLayoutProps {
  children?: ReactNode;
}

const PublicLayout = ({ children }: PublicLayoutProps) => {
  return (
    <Box sx={Shell.outerBackgroundSx}>
      <PublicAppBar showBrandTitle>
        <ColorModeSwitch
          checked={stores.userPreferencesStore.theme.palette.mode === "dark"}
          inputProps={{ "aria-label": "Dark mode" }}
          onChange={(event) => stores.userPreferencesStore.setColorMode(event.target.checked ? "dark" : "light")}
        />
      </PublicAppBar>
      <Container maxWidth="xl" disableGutters sx={Shell.contentBackgroundSx}>
        <Box component="main">
          <Toolbar sx={Shell.appBarSpacerSx} />
          {children ?? <Outlet />}
        </Box>
      </Container>
    </Box>
  );
};

export default PublicLayout;
