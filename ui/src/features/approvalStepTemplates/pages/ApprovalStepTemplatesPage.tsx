import ApprovalStepTemplatesGrid from "@/features/approvalStepTemplates/components/ApprovalStepTemplatesGrid";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import HelpPopover from "@/shared/components/overlays/HelpPopover";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { observer } from "mobx-react-lite";
import { useLocation } from "react-router-dom";

interface ApprovalStepTemplatesLocationState {
  currentTemplateGlobalId?: string;
}

const ApprovalStepTemplatesPage = () => {
  usePageTitle("Templates");
  const location = useLocation();
  const { currentTemplateGlobalId } = (location.state as ApprovalStepTemplatesLocationState | null) ?? {};
  return (
    <>
      <PageBreadcrumbs
        items={[
          {
            label: "Templates",
            titleAction: (
              <HelpPopover
                docsHref="/docs/templates/"
                helpText="Reuse organization workflow steps and participants in new requests."
              />
            ),
          },
        ]}
      />
      <ApprovalStepTemplatesGrid currentTemplateGlobalId={currentTemplateGlobalId} />
    </>
  );
};

export default observer(ApprovalStepTemplatesPage);
