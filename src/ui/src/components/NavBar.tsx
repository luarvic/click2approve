import { AttachFile } from "@mui/icons-material";
import { AppBar, Button, Container, Toolbar, Typography } from "@mui/material";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import { userAccountStore } from "../stores/UserAccountStore";
import { userFileStore } from "../stores/UserFileStore";

// Main menu.
export const NavBar = () => {
  const { currentUser, signOut } = userAccountStore;
  const { clearUserFiles } = userFileStore;
  const navigate = useNavigate();

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <AttachFile sx={{ display: "block", mr: 1 }} />
          <Typography
            variant="h6"
            component="a"
            href="/"
            sx={{ flexGrow: 1, color: "inherit", textDecoration: "none" }}
          >
            File Manager
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
      </Container>
    </AppBar>
  );
};

export default observer(NavBar);
