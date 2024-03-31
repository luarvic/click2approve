import { Verified } from "@mui/icons-material";
import { AppBar, Button, Link, Toolbar, Typography } from "@mui/material";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import { stores } from "../../stores/Stores";
import { DEFAULT_PATH } from "../../stores/constantsStore";

const MainNavBar = () => {
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
        {!stores.userAccountStore.currentUser ? (
          <Button variant="outlined" color="inherit" href="/signIn">
            Sign in
          </Button>
        ) : (
          <>
            <Link sx={{ mr: 1 }} color="inherit" href={DEFAULT_PATH}>
              {stores.userAccountStore.currentUser.email.toLowerCase()}
            </Link>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => {
                stores.fileStore.clearUserFiles();
                stores.userAccountStore.signOut();
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

export default observer(MainNavBar);
