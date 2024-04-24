import { Menu, Verified } from "@mui/icons-material";
import {
  AppBar,
  Box,
  Button,
  IconButton,
  Link,
  Toolbar,
  Typography,
} from "@mui/material";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import { DEFAULT_PATH } from "../../data/constants";
import { stores } from "../../stores/stores";

const MainAppBar = () => {
  const navigate = useNavigate();

  return (
    <AppBar position="static">
      <Toolbar disableGutters sx={{ pl: 2, pr: 2 }}>
        <Box sx={{ flexGrow: 1 }}>
          <Link
            component="button"
            variant="body2"
            sx={{
              display: "flex",
              alignItems: "center",
              color: "inherit",
              textDecoration: "none",
              width: "fit-content",
            }}
            onClick={() => {
              navigate(
                stores.userAccountStore.currentUser ? DEFAULT_PATH : "/"
              );
            }}
          >
            <Verified sx={{ mr: 1 }} />
            <Typography
              variant="h6"
              sx={{ color: "inherit", textDecoration: "none" }}
            >
              click2approve
            </Typography>
          </Link>
        </Box>
        {!stores.userAccountStore.currentUser ? (
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => navigate("signIn")}
          >
            Sign in
          </Button>
        ) : (
          <IconButton
            color="inherit"
            onClick={() => stores.commonStore.setUserSettingsDrawerIsOpen(true)}
          >
            <Menu />
          </IconButton>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default observer(MainAppBar);
