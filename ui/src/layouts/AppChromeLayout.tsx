import { stores } from "@/app/rootStore";
import MainLayout from "@/layouts/MainLayout";
import PublicLayout from "@/layouts/PublicLayout";
import { AppBarOptions } from "@/shared/models/appBarOptions";
import { observer } from "mobx-react-lite";
import { ReactNode } from "react";

interface AppChromeLayoutProps {
  appBarOptions?: AppBarOptions;
  children?: ReactNode;
}

const AppChromeLayout = ({ appBarOptions, children }: AppChromeLayoutProps) => {
  return stores.userAccountStore.currentUser ? (
    <MainLayout appBarOptions={appBarOptions}>{children}</MainLayout>
  ) : (
    <PublicLayout>{children}</PublicLayout>
  );
};

export default observer(AppChromeLayout);
