import { stores } from "@/app/rootStore";
import TasksGrid from "@/features/approvalRequests/components/TasksGrid";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import HelpPopover from "@/shared/components/overlays/HelpPopover";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { observer } from "mobx-react-lite";
import { useLocation } from "react-router-dom";

interface TasksLocationState {
  currentTaskGlobalId?: string;
}

const TasksPage = () => {
  const numberOfUncompletedTasks = stores.approvalRequestTaskStore.numberOfUncompletedTasks;
  const pageTitle = numberOfUncompletedTasks > 0 ? `Tasks (${numberOfUncompletedTasks})` : "Tasks";
  usePageTitle(pageTitle);
  const location = useLocation();
  const { currentTaskGlobalId } = (location.state as TasksLocationState | null) ?? {};
  return (
    <>
      <PageBreadcrumbs
        items={[
          {
            label: "Tasks",
            titleAction: (
              <HelpPopover
                docsHref="/docs/complete-a-task/"
                helpText="Find and complete tasks in the selected workspace."
              />
            ),
          },
        ]}
      />
      <TasksGrid currentTaskGlobalId={currentTaskGlobalId} />
    </>
  );
};

export default observer(TasksPage);
