import { observer } from "mobx-react-lite";
import { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button, Container, Icon, Menu, MenuItem } from "semantic-ui-react";
import { userAccountStoreContext } from "../stores/UserAccountStore";
import { userFileStoreContext } from "../stores/UserFileStore";

export const NavBar = () => {
  const location = useLocation();
  const { pathname } = location;
  const userAccountStore = useContext(userAccountStoreContext);
  const userFileStore = useContext(userFileStoreContext);
  const { currentUser, signOut } = userAccountStore;
  const { clearUserFiles } = userFileStore;

  return (
    <Menu text>
      <MenuItem as={Link} to="/">
        <Icon name="home" />
        Home
      </MenuItem>
      {currentUser === undefined ? (
        <></>
      ) : currentUser === null ? (
        !pathname.startsWith("/sign") && (
          <Container>
            <MenuItem position="right">
              <Button color="green" as={Link} to="/signin">
                <Icon name="sign-in" />
                Sign in
              </Button>
            </MenuItem>
          </Container>
        )
      ) : (
        <Container>
          <MenuItem position="right">
            <strong>{currentUser.username}</strong>
          </MenuItem>
          <MenuItem>
            <Button
              as={Link}
              to="/"
              onClick={() => {
                clearUserFiles();
                signOut();
              }}
            >
              <Icon name="sign-out" />
              Sign out
            </Button>
          </MenuItem>
        </Container>
      )}
    </Menu>
  );
};

export default observer(NavBar);
