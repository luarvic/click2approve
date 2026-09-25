import { Pages } from "@/shared/components/layout/pageStyles";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import { Routes } from "@/shared/routing/routes";
import { Box, Container, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { Link as RouterLink } from "react-router-dom";

const baseUrl = import.meta.env.BASE_URL.endsWith("/") ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;
const logoSrc = `${baseUrl}logo.svg`;

interface ActionResultProps {
  title: string;
  message: ReactNode;
  action?: ReactNode;
}

const ActionResult = ({ message, title, action }: ActionResultProps) => {
  return (
    <Container component="main" maxWidth={Pages.centeredMessageMaxWidth}>
      <Box sx={Pages.centeredMessageContainerSx}>
        <Box
          component={RouterLink}
          to={Routes.defaultPath}
          aria-label="Click2Approve home"
          sx={Pages.centeredMessageLogoLinkSx}
        >
          <Box component="img" src={logoSrc} alt="Click2Approve" sx={Pages.centeredMessageLogoSx} />
        </Box>
        <PageBreadcrumbs items={[{ label: "Home", to: Routes.defaultPath }, { label: title }]} />
        <Typography>{message}</Typography>
        {action}
      </Box>
    </Container>
  );
};

export default ActionResult;
