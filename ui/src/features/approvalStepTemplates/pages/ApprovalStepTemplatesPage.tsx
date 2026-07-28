import ApprovalStepTemplatesGrid from "@/features/approvalStepTemplates/components/ApprovalStepTemplatesGrid";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { observer } from "mobx-react-lite";
import { useLocation } from "react-router-dom";

interface ApprovalStepTemplatesLocationState {
  currentTemplateId?: number;
}

const ApprovalStepTemplatesPage = () => {
  usePageTitle("Templates");
  const location = useLocation();
  const { currentTemplateId } =
    (location.state as ApprovalStepTemplatesLocationState | null) ?? {};
  return (
    <>
      <PageBreadcrumbs items={[{ label: "Templates" }]} />
      <ApprovalStepTemplatesGrid currentTemplateId={currentTemplateId} />
    </>
  );
};

export default observer(ApprovalStepTemplatesPage);
