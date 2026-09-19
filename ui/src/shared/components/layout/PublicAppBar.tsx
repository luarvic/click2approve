import { Shell } from "@/shared/components/layout/shellStyles";
import { Routes } from "@/shared/routing/routes";
import { AppBar, Box, Link, Toolbar, Typography } from "@mui/material";
import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

const baseUrl = import.meta.env.BASE_URL.endsWith("/") ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;
const logoSrc = `${baseUrl}logo.svg`;

interface PublicAppBarProps {
  children?: ReactNode;
  homePath?: string;
  showBrand?: boolean;
  showBrandTitle?: boolean;
  startContent?: ReactNode;
}

const PublicAppBar = ({
  children,
  homePath = Routes.defaultPath,
  showBrand = true,
  showBrandTitle = false,
  startContent,
}: PublicAppBarProps) => {
  const navigate = useNavigate();

  return (
    <AppBar position="fixed" color="transparent" elevation={0} sx={Shell.appBarSx}>
      <Toolbar disableGutters sx={Shell.appBarToolbarSx}>
        {startContent}
        <Box sx={Shell.appBarBrandContainerSx}>
          {showBrand && (
            <Link
              component="button"
              variant="body2"
              aria-label="Click2Approve home"
              sx={Shell.appBarBrandLinkSx}
              onClick={() => navigate(homePath)}
            >
              <Box component="img" src={logoSrc} alt="" aria-hidden="true" sx={Shell.appBarLogoSx} />
              {showBrandTitle && (
                <Typography variant="h6" sx={Shell.appBarBrandTitleSx}>
                  Click2Approve
                </Typography>
              )}
            </Link>
          )}
        </Box>
        {children}
      </Toolbar>
    </AppBar>
  );
};

export default PublicAppBar;
