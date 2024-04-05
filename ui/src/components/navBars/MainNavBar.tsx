import { Menu, Verified } from "@mui/icons-material";
import { AppBar, Button, IconButton, Toolbar, Typography } from "@mui/material";
import { observer } from "mobx-react-lite";
import { stores } from "../../stores/Stores";

const MainNavBar = () => {
  return (
    <AppBar position="static">
      <Toolbar disableGutters sx={{ pl: 2, pr: 2 }}>
        <Verified sx={{ mr: 1 }} />
        <Typography
          variant="h6"
          sx={{ flexGrow: 1, color: "inherit", textDecoration: "none" }}
        >
          click2approve
        </Typography>
        {!stores.userAccountStore.currentUser ? (
          <Button variant="outlined" color="inherit" href="/signIn">
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

export default observer(MainNavBar);
