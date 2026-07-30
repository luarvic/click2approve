import { stores } from "@/app/rootStore";
import MainLayout from "@/layouts/MainLayout";
import PublicLayout from "@/layouts/PublicLayout";
import { observer } from "mobx-react-lite";

const AppChromeLayout = () => {
  return stores.userAccountStore.currentUser ? <MainLayout /> : <PublicLayout />;
};

export default observer(AppChromeLayout);
