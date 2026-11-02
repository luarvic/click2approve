import AppBrandBadge from "@/shared/components/layout/AppBrandBadge";
import { Shell } from "@/shared/components/layout/shellStyles";
import { Routes } from "@/shared/routing/routes";
import { AppBar, Box, Link, Toolbar, Typography } from "@mui/material";
import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

const baseUrl = import.meta.env.BASE_URL.endsWith("/") ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;
const logoSrc = `${baseUrl}logo-wall-to-wall.svg`;
const compactLogoSrc = `${baseUrl}logo-narrow.svg`;

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
  showBrandTitle = true,
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
              sx={Shell.mainMenuBrandLinkSx}
              onClick={() => navigate(homePath)}
            >
              <Box
                component="img"
                src={showBrandTitle ? logoSrc : compactLogoSrc}
                alt=""
                aria-hidden="true"
                sx={showBrandTitle ? Shell.publicAppBarLogoSx : Shell.appBarLogoSx}
              />
              {showBrandTitle && (
                <Typography component="span" variant="h6" sx={Shell.appBarBrandTitleSx}>
                  <AppBrandBadge />
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
