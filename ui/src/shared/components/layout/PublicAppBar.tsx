import AppBrandBadge from "@/shared/components/layout/AppBrandBadge";
import { Shell } from "@/shared/components/layout/shellStyles";
import { Routes } from "@/shared/routing/routes";
import { AppBar, Box, Link, Toolbar, Typography } from "@mui/material";
import { createElement, ReactNode } from "react";
import { useNavigate } from "react-router-dom";

const baseUrl = import.meta.env.BASE_URL.endsWith("/") ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;
const logoSrc = `${baseUrl}logo-wall-to-wall.svg`;

export const SupportLauncher = () => createElement("c2a-support-launcher", { style: { display: "contents" } });

interface PublicAppBarProps {
  children?: ReactNode;
  homePath?: string;
  showBrand?: boolean;
  startContent?: ReactNode;
}

const PublicAppBar = ({
  children,
  homePath = Routes.defaultPath,
  showBrand = true,
  startContent,
}: PublicAppBarProps) => {
  const navigate = useNavigate();

  return (
    <AppBar position="fixed" color="transparent" elevation={0} sx={Shell.appBarSx}>
      <Toolbar disableGutters sx={Shell.appBarToolbarSx}>
        {startContent}
        <Box sx={Shell.appBarBrandContainerSx(showBrand)}>
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
                src={logoSrc}
                alt=""
                aria-hidden="true"
                sx={Shell.publicAppBarLogoSx}
              />
              <Typography component="span" variant="h6" sx={Shell.appBarBrandTitleSx}>
                <AppBrandBadge />
              </Typography>
            </Link>
          )}
        </Box>
        {children}
      </Toolbar>
    </AppBar>
  );
};

export default PublicAppBar;
