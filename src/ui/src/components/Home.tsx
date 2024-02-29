import { Box } from "@mui/material";
import { observer } from "mobx-react-lite";
import { userAccountStore } from "../stores/UserAccountStore";
import { Tabs } from "./Tabs";
import UserFiles from "./UserFiles";

// Shows either message or user files depending on whether it's anonymous or specific user.
export const Home = () => {
  const { currentUser } = userAccountStore;

  return currentUser === undefined ? (
    <></>
  ) : currentUser === null ? (
    <Box sx={{ p: 2 }}>Please, sign in to manage your files.</Box>
  ) : (
    <Box sx={{ display: "flex", pt: 2 }}>
      <Tabs />
      <UserFiles />
    </Box>
  );
};

export default observer(Home);
