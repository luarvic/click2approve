import { AttachFile } from "@mui/icons-material";
import { AppBar, Button, Toolbar, Typography } from "@mui/material";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import { userAccountStore } from "../stores/UserAccountStore";
import { userFileStore } from "../stores/UserFileStore";

// Main menu.
const NavBar = () => {
  const { currentUser, signOut } = userAccountStore;
  const { clearUserFiles } = userFileStore;
  const navigate = useNavigate();

  return (
    <AppBar position="static">
      <Toolbar disableGutters sx={{ pl: 2, pr: 2 }}>
        <AttachFile sx={{ display: "block", mr: 1 }} />
        <Typography
          variant="h6"
          component="a"
          href="/"
          sx={{ flexGrow: 1, color: "inherit", textDecoration: "none" }}
        >
          Click2approve
        </Typography>
        {currentUser === undefined ? (
          <></>
        ) : currentUser === null ? (
          <Button variant="outlined" color="inherit" href="/signin">
            Sign in
          </Button>
        ) : (
          <>
            <Typography sx={{ mr: 1 }}>{currentUser.email}</Typography>
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
