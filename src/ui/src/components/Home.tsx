import { Box } from "@mui/material";
import { observer } from "mobx-react-lite";
import { commonStore, Tab } from "../stores/CommonStore";
import { userAccountStore } from "../stores/UserAccountStore";
import { Archive } from "./Archive";
import { Inbox } from "./Inbox";
import { Sent } from "./Sent";
import { Tabs } from "./Tabs";
import UserFiles from "./UserFiles";

// Shows either message or user files depending on whether it's anonymous or specific user.
export const Home = () => {
  const { currentUser } = userAccountStore;
  const { getCurrentTab } = commonStore;
  const currentTab = () => {
    switch (getCurrentTab()) {
      case Tab.Files:
        return <UserFiles />;
      case Tab.Inbox:
        return <Inbox />;
      case Tab.Archive:
        return <Archive />;
      case Tab.Sent:
        return <Sent />;
    }
  };

  return currentUser === undefined ? (
    <></>
  ) : currentUser === null ? (
    <Box sx={{ p: 2 }}>Please, sign in to manage your files.</Box>
  ) : (
    <Box sx={{ display: "flex", pt: 2 }}>
      <Tabs />
      {currentTab()}
    </Box>
  );
};

export default observer(Home);
