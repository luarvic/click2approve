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

// Sign in form.
export const SignIn = () => {
  const [userAccount, setUserAccount] = useState<IUserAccount>(
    new UserAccount()
  );

  const userAccountStore = useContext(userAccountStoreContext);
  const { signIn } = userAccountStore;

  const navigate = useNavigate();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserAccount({ ...userAccount, [event.target.name]: event.target.value });
  };

  const handleFormSubmit = async () => {
    if (await signIn(userAccount)) {
      navigate("/");
    }
  };

  return (
    <Grid textAlign="center" style={{ height: "100vh" }}>
      <Grid.Column style={{ maxWidth: 450 }}>
        <Header as="h2" textAlign="center">
          Sign in to your account
        </Header>
        <Form size="large" onSubmit={handleFormSubmit}>
          <Segment>
            <Form.Input
              fluid
              icon="user"
              iconPosition="left"
              placeholder="Username"
              value={userAccount.username}
              name="username"
              onChange={handleChange}
            />
            <Form.Input
              fluid
              icon="lock"
              iconPosition="left"
              placeholder="Password"
              type="password"
              value={userAccount.password}
              name="password"
              onChange={handleChange}
            />
            <Button color="green" fluid>
              Sign in
            </Button>
          </Segment>
        </Form>
        <Message>
          New to us? <a href="/signup">Sign up</a>
        </Message>
      </Grid.Column>
    </Grid>
  );
};

export default observer(SignIn);
