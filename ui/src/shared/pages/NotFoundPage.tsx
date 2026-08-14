import { stores } from "@/app/rootStore";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import { Pages, Routes } from "@/shared/constants/constants";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { Box, Container, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { useLayoutEffect } from "react";
import { Link as RouterLink } from "react-router-dom";

const baseUrl = import.meta.env.BASE_URL.endsWith("/") ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;
const logoSrc = `${baseUrl}logo.svg`;

const notFoundLogoSx: SxProps<Theme> = {
  display: "block",
  height: 72,
  width: 72,
};

const notFoundLogoLinkSx: SxProps<Theme> = {
  display: "block",
  mb: 2,
};

const notFoundMessageSx: SxProps<Theme> = {
  mb: 3,
  textAlign: "center",
};

const NotFoundPage = () => {
  usePageTitle("Page not found");

  useLayoutEffect(() => {
    stores.commonStore.setAppBarOptions({ showMainMenuButton: false });
    stores.commonStore.setMainMenuDrawerIsOpen(false);

    return () => stores.commonStore.setAppBarOptions(null);
  }, []);

  return (
    <Container component="main" maxWidth={Pages.centeredMessageMaxWidth}>
      <Box sx={Pages.centeredMessageContainerSx}>
        <Box component={RouterLink} to={Routes.defaultPath} aria-label="Click2Approve home" sx={notFoundLogoLinkSx}>
          <Box component="img" src={logoSrc} alt="Click2Approve" sx={notFoundLogoSx} />
        </Box>
        <PageBreadcrumbs items={[{ label: "Home", to: Routes.defaultPath }, { label: "Page not found" }]} />
        <Typography sx={notFoundMessageSx}>Sorry, but the page you are looking for has not been found.</Typography>
      </Box>
    </Container>
  );
};

export default NotFoundPage;
