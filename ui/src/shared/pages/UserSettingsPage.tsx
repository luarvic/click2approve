import { stores } from "@/app/rootStore";
import { AuthForms, Pages } from "@/shared/constants/constants";
import {
  Box,
  FormControlLabel,
  FormGroup,
  Switch,
  Typography,
} from "@mui/material";
import { observer } from "mobx-react-lite";
import React from "react";
import { Navigate } from "react-router-dom";

const UserSettingsPage = () => {
  const handleColorModeChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    stores.userSettingsStore.setColorMode(
      event.target.checked ? "dark" : "light",
    );
  };

  return stores.userAccountStore.currentUser ? (
    <Box sx={Pages.userSettingsContainerSx}>
      <Typography component="h1" variant="h5">
        User settings
      </Typography>
      <Box component="form" noValidate sx={AuthForms.formSx}>
        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                checked={stores.userSettingsStore.theme.palette.mode === "dark"}
                onChange={handleColorModeChange}
              />
            }
            label="Dark mode"
          />
        </FormGroup>
      </Box>
    </Box>
  ) : (
    <Navigate to="/signIn" />
  );
};

export default observer(UserSettingsPage);
