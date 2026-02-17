import { Menu } from "@mui/icons-material";
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
            <Box
              component="svg"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              role="img"
              aria-label="click2approve"
              sx={{ display: "block", width: 36, height: 36, color: "inherit" }}
            >
              <defs>
                <mask id="click2approve-cutout">
                  <rect width="24" height="24" fill="none" />
                  <path
                    d="M6.4 13.9L10.8 17.6L17.0 7.8"
                    stroke="white"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </mask>
              </defs>
              <rect
                x="1.5"
                y="1.5"
                width="21"
                height="21"
                rx="6"
                fill="currentColor"
                mask="url(#click2approve-cutout)"
              />
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
