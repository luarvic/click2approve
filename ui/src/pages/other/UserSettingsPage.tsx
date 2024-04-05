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
import { stores } from "../../stores/stores";

const UserSettingsPage = () => {
  const handleColorModeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    stores.userSettingsStore.setColorMode(
      event.target.checked ? "dark" : "light"
    );
  };

  return stores.userAccountStore.currentUser ? (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography component="h1" variant="h5">
        User settings
      </Typography>
      <Box component="form" noValidate sx={{ mt: 1 }}>
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
