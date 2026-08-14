import { Routes, Shell } from "@/shared/constants/constants";
import { AppBar, Box, Container, Link, Toolbar, Typography } from "@mui/material";
import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

const baseUrl = import.meta.env.BASE_URL.endsWith("/") ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;
const logoSrc = `${baseUrl}logo.svg`;

interface PublicAppBarProps {
  collapseBrandAreaWhenTitleHidden?: boolean;
  brandTitleHideBelowWidth?: number;
  children?: ReactNode;
  homePath?: string;
  mainMenuDrawerIsVisible?: boolean;
  profileDrawerIsOpen?: boolean;
  showBrandTitle?: boolean;
  startContent?: ReactNode;
}

const PublicAppBar = ({
  collapseBrandAreaWhenTitleHidden = false,
  brandTitleHideBelowWidth = Shell.appBarBrandTitleWithoutTenantPickerHideBelowWidth,
  children,
  homePath = Routes.defaultPath,
  mainMenuDrawerIsVisible = false,
  profileDrawerIsOpen = false,
  showBrandTitle = false,
  startContent,
}: PublicAppBarProps) => {
  const navigate = useNavigate();

  return (
    <AppBar
      position="fixed"
      color="transparent"
      elevation={0}
      sx={Shell.appBarSx(mainMenuDrawerIsVisible, profileDrawerIsOpen)}
    >
      <Container maxWidth="xl" disableGutters>
        <Toolbar disableGutters sx={Shell.appBarToolbarSx}>
          {startContent}
          <Box sx={Shell.appBarBrandContainerSx(brandTitleHideBelowWidth, collapseBrandAreaWhenTitleHidden)}>
            <Link
              component="button"
              variant="body2"
              aria-label="Click2Approve home"
              sx={Shell.appBarBrandLinkSx}
              onClick={() => navigate(homePath)}
            >
              <Box component="img" src={logoSrc} alt="" aria-hidden="true" sx={Shell.appBarLogoSx} />
              {showBrandTitle && (
                <Typography variant="h6" sx={Shell.appBarBrandTitleSx(brandTitleHideBelowWidth)}>
                  Click2Approve
                </Typography>
              )}
            </Link>
          </Box>
          {children}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default PublicAppBar;
