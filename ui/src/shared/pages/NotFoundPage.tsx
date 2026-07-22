import { Pages, Routes } from "@/shared/constants/constants";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { Box, Button, Container, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { Link as RouterLink } from "react-router-dom";

const baseUrl = import.meta.env.BASE_URL.endsWith("/")
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`;
const logoSrc = `${baseUrl}logo.svg`;

const notFoundLogoSx: SxProps<Theme> = {
  display: "block",
  height: 72,
  mb: 2,
  width: 72,
};

const notFoundMessageSx: SxProps<Theme> = {
  mb: 3,
  textAlign: "center",
};

const NotFoundPage = () => {
  usePageTitle("Page not found");

  return (
    <Container component="main" maxWidth={Pages.centeredMessageMaxWidth}>
      <Box sx={Pages.centeredMessageContainerSx}>
        <Box
          component="img"
          src={logoSrc}
          alt="Click2Approve"
          sx={notFoundLogoSx}
        />
        <Typography component="h1" variant="h5" sx={Pages.titleSx}>
          Page not found
        </Typography>
        <Typography sx={notFoundMessageSx}>
          Sorry, but the page you are looking for has not been found.
        </Typography>
        <Button
          component={RouterLink}
          to={Routes.defaultPath}
          variant="outlined"
        >
          Back to home
        </Button>
      </Box>
    </Container>
  );
};

export default NotFoundPage;
