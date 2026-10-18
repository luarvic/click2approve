import { stores } from "@/app/rootStore";
import NotificationsGrid from "@/features/notifications/components/NotificationsGrid";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import HelpPopover from "@/shared/components/overlays/HelpPopover";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { observer } from "mobx-react-lite";

const NotificationsPage = () => {
  usePageTitle(`Notifications (${stores.notificationStore.unreadCount})`);
  return (
    <>
      <PageBreadcrumbs
        items={[
          {
            label: "Notifications",
            titleAction: (
              <HelpPopover
                docsHref="/docs/notifications/"
                helpText="Open notifications to review the latest activity and related work."
              />
            ),
          },
        ]}
      />
      <NotificationsGrid />
    </>
  );
};

export default observer(NotificationsPage);
