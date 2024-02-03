import { observer } from "mobx-react-lite";
import React, { useContext } from "react";
import { Container, Message } from "semantic-ui-react";
import { userAccountStoreContext } from "../stores/UserAccountStore";
import UserFiles from "./UserFiles";

// Shows either message or user files depending on whether it's anonymous or specific user. 
export const Home = () => {
  const userAccountStore = useContext(userAccountStoreContext);
  const { currentUser } = userAccountStore;

  return currentUser === undefined ? (
    <></>
  ) : currentUser === null ? (
    <Container>
      <Message>Please, sign in to manage your files.</Message>
    </Container>
  ) : (
    <UserFiles />
  );
};

export default observer(Home);
