import { stores } from "@/app/rootStore";
import MainLayout from "@/layouts/MainLayout";
import PublicLayout from "@/layouts/PublicLayout";
import { observer } from "mobx-react-lite";
import { ReactNode } from "react";

interface AppChromeLayoutProps {
  children?: ReactNode;
}

const AppChromeLayout = ({ children }: AppChromeLayoutProps) => {
  return stores.userAccountStore.currentUser ? (
    <MainLayout>{children}</MainLayout>
  ) : (
    <PublicLayout>{children}</PublicLayout>
  );
};

export default observer(AppChromeLayout);
