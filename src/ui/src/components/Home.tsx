import { Box, Container } from "@mui/material";
import { observer } from "mobx-react-lite";
import { userAccountStore } from "../stores/UserAccountStore";
import UserFiles from "./UserFiles";

// Shows either message or user files depending on whether it's anonymous or specific user.
export const Home = () => {
  const { currentUser } = userAccountStore;

  return currentUser === undefined ? (
    <></>
  ) : currentUser === null ? (
    <Container>
      <Box sx={{ pt: 3 }}>Please, sign in to manage your files.</Box>
    </Container>
  ) : (
    <UserFiles />
  );
};

export default observer(Home);
