import { stores } from "@/app/rootStore";
import NotificationsGrid from "@/features/notifications/components/NotificationsGrid";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { observer } from "mobx-react-lite";

const NotificationsPage = () => {
  usePageTitle(`Notifications (${stores.notificationStore.unreadCount})`);
  return (
    <>
      <PageBreadcrumbs items={[{ label: "Notifications" }]} />
      <NotificationsGrid />
    </>
  );
};

export default observer(NotificationsPage);
