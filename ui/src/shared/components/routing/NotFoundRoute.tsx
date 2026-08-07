import AppChromeLayout from "@/layouts/AppChromeLayout";
import WrapperLayout from "@/layouts/WrapperLayout";
import NotFoundPage from "@/shared/pages/NotFoundPage";

const NotFoundRoute = () => (
  <AppChromeLayout appBarOptions={{ showMainMenuButton: false }}>
    <WrapperLayout>
      <NotFoundPage />
    </WrapperLayout>
  </AppChromeLayout>
);

export default NotFoundRoute;
