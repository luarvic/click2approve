import { Link } from "react-router-dom";
import { Button, Icon, Menu, MenuItem } from "semantic-ui-react";

export const NavBar = () => {
  return (
    <Menu>
      <MenuItem as={Link} to="/">
        <Icon name="home" />
        Home
      </MenuItem>
      <MenuItem position="right">
        <Button color="green">
          <Icon name="sign-in" />
          Sign in
        </Button>
      </MenuItem>
    </Menu>
  );
};

export default NavBar;
