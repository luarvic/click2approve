import { Pages } from "@/shared/components/layout/pageStyles";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { Routes } from "@/shared/routing/routes";
import { Box, Container, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import type { ReactNode } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";

const baseUrl = import.meta.env.BASE_URL.endsWith("/") ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;
const logoSrc = `${baseUrl}logo.svg`;

const informationLogoSx: SxProps<Theme> = {
  display: "block",
  height: 72,
  width: 72,
};

const informationLogoLinkSx: SxProps<Theme> = {
  display: "block",
  mb: 2,
};

interface InformationPageLocationState {
  title?: string;
  message?: ReactNode;
}

interface InformationPageProps {
  message?: ReactNode;
  title?: string;
}

const InformationPage = ({ message, title }: InformationPageProps) => {
  const location = useLocation();
  const locationState = (location.state ?? {}) as InformationPageLocationState;
  const pageTitle = title ?? locationState.title ?? "Information";
  const pageMessage = message ?? locationState.message;
  usePageTitle(pageTitle);

  return (
    <Container component="main" maxWidth={Pages.centeredMessageMaxWidth}>
      <Box sx={Pages.centeredMessageContainerSx}>
        <Box component={RouterLink} to={Routes.defaultPath} aria-label="Click2Approve home" sx={informationLogoLinkSx}>
          <Box component="img" src={logoSrc} alt="Click2Approve" sx={informationLogoSx} />
        </Box>
        <PageBreadcrumbs items={[{ label: "Home", to: Routes.defaultPath }, { label: pageTitle }]} />
        <Typography>{pageMessage}</Typography>
      </Box>
    </Container>
  );
};

export default InformationPage;
