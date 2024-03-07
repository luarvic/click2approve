import { observer } from "mobx-react-lite";
import { userAccountStore } from "../stores/UserAccountStore";
import UserFiles from "./UserFiles";
import About from "./About";

// Shows either message or user files depending on whether it's anonymous or specific user.
const Home = () => {
  const { currentUser } = userAccountStore;

  return currentUser === undefined ? (
    <></>
  ) : currentUser === null ? (
    <About />
  ) : (
    <UserFiles />
  );
};

export default observer(Home);
