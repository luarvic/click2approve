import { stores } from "@/app/rootStore";
import MainActionButton from "@/shared/components/buttons/MainActionButton";
import { Pages } from "@/shared/components/layout/pageStyles";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { Routes } from "@/shared/routing/routes";
import { Container } from "@mui/material";
import { useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  usePageTitle("Page not found");
  const navigate = useNavigate();

  useLayoutEffect(() => {
    stores.commonStore.setAppBarOptions({ showMainMenuButton: false });
    stores.commonStore.setMainMenuDrawerIsOpen(false);

    return () => stores.commonStore.setAppBarOptions(null);
  }, []);

  return (
    <Container maxWidth={Pages.centeredMessageMaxWidth} sx={Pages.centeredStateSx}>
      <PageBreadcrumbs
        align="center"
        items={[{ label: "Page not found" }]}
        subtitle="It may have moved, or access may be restricted."
      />
      <MainActionButton onClick={() => navigate(Routes.defaultPath)}>Home</MainActionButton>
    </Container>
  );
};

export default NotFoundPage;
