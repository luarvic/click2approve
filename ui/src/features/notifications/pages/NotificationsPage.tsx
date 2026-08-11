import NotificationsGrid from "@/features/notifications/components/NotificationsGrid";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import { usePageTitle } from "@/shared/hooks/usePageTitle";

const NotificationsPage = () => {
  usePageTitle("Notifications");
  return (
    <>
      <PageBreadcrumbs items={[{ label: "Notifications" }]} />
      <NotificationsGrid />
    </>
  );
};

export default NotificationsPage;
