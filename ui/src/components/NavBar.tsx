import { Verified } from "@mui/icons-material";
import { AppBar, Button, Link, Toolbar, Typography } from "@mui/material";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import { DEFAULT_PATH } from "../stores/Constants";
import { fileStore } from "../stores/FileStore";
import { userAccountStore } from "../stores/UserAccountStore";

// Main menu.
const NavBar = () => {
  const { currentUser, signOut } = userAccountStore;
  const { clearUserFiles } = fileStore;
  const navigate = useNavigate();

  return (
    <AppBar position="static">
      <Toolbar disableGutters sx={{ pl: 2, pr: 2 }}>
        <Verified sx={{ display: "block", mr: 1 }} />
        <Typography
          variant="h6"
          component="a"
          href="/"
          sx={{ flexGrow: 1, color: "inherit", textDecoration: "none" }}
        >
          click2approve
        </Typography>
        {!currentUser ? (
          <Button variant="outlined" color="inherit" href="/signin">
            Sign in
          </Button>
        ) : (
          <>
            <Link sx={{ mr: 1 }} color="inherit" href={DEFAULT_PATH}>
              {currentUser.email.toLowerCase()}
            </Link>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => {
                clearUserFiles();
                signOut();
                navigate("/");
              }}
            >
              Sign out
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default observer(NavBar);
