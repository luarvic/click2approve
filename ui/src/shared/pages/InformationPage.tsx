import { Pages } from "@/shared/constants/constants";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { Box, Container, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";

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
        <Typography component="h1" variant="h5" sx={Pages.titleSx}>
          {pageTitle}
        </Typography>
        <Typography>{pageMessage}</Typography>
      </Box>
    </Container>
  );
};

export default InformationPage;
