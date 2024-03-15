import { observer } from "mobx-react-lite";
import { userAccountStore } from "../stores/UserAccountStore";
import About from "./About";
import TabFiles from "./grids/GridFiles";

// Shows either message or user files depending on whether it's anonymous or specific user.
const Home = () => {
  const { currentUser } = userAccountStore;

  return currentUser === undefined ? (
    <></>
  ) : currentUser === null ? (
    <About />
  ) : (
    <TabFiles />
  );
};

export default observer(Home);
