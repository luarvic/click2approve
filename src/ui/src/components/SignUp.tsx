import { observer } from "mobx-react-lite";
import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Form,
  Grid,
  Header,
  Message,
  Segment,
} from "semantic-ui-react";
import { IUserAccount, UserAccount } from "../models/UserAccount";
import { userAccountStoreContext } from "../stores/UserAccountStore";

// Sign up form.
export const SignUp = () => {
  const [userAccount, setUserAccount] = useState<IUserAccount>(
    new UserAccount()
  );
  const navigate = useNavigate();
  const userAccountStore = useContext(userAccountStoreContext);
  const { signUp } = userAccountStore;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserAccount({ ...userAccount, [event.target.name]: event.target.value });
  };

  const handleFormSubmit = async () => {
    if (await signUp(userAccount)) {
      navigate("/");
    }
  };

  return (
    <Grid textAlign="center" style={{ height: "100vh" }}>
      <Grid.Column style={{ maxWidth: 450 }}>
        <Header as="h2" textAlign="center">
          Create new account
        </Header>
        <Form size="large" onSubmit={handleFormSubmit} autoComplete="off">
          <Segment>
            <Form.Input
              fluid
              icon="user"
              iconPosition="left"
              placeholder="Username"
              name="username"
              onChange={handleChange}
            />
            <Form.Input
              fluid
              icon="lock"
              iconPosition="left"
              placeholder="Password"
              type="password"
              name="password"
              onChange={handleChange}
            />
            <Form.Input
              fluid
              icon="lock"
              iconPosition="left"
              placeholder="Confirm"
              type="password"
              name="passwordConfirmation"
              onChange={handleChange}
            />
            <Button color="green" fluid>
              Sign up
            </Button>
          </Segment>
        </Form>
        <Message>
          Already have an account? <a href="/signin">Sign in</a>
        </Message>
      </Grid.Column>
    </Grid>
  );
};

export default observer(SignUp);
