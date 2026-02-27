import { Menu } from "@mui/icons-material";
import {
  AppBar,
  Box,
  Button,
  IconButton,
  Link,
  Toolbar,
  Typography
} from "@mui/material";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import { DEFAULT_PATH } from "../../data/constants";
import { stores } from "../../stores/stores";

const MainAppBar = () => {
  const navigate = useNavigate();

  return (
    <AppBar position="static" color="transparent" elevation={0}>
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
            <Box
              component="svg"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              role="img"
              aria-label="click2approve"
              sx={{
                display: "block",
                width: 36,
                height: 36,
                color: "inherit",
                mr: 0.5,
              }}
            >
              <g transform="rotate(45 12 12)">
                <rect x="7.5" y="7.5"
                  width="13" height="13"
                  rx="3"
                  fill="#22C55E" />
              </g>
              <g transform="rotate(45 12 12)">
                <rect x="3" y="3"
                  width="13" height="13"
                  rx="3"
                  fill="#FFFFFF"
                  stroke="#22C55E"
                  stroke-width="0.8" />
              </g>
            </Box>
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
            onClick={() => navigate("/signIn")}
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
