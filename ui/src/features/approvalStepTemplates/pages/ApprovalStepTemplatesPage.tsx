import ApprovalStepTemplatesGrid from "@/features/approvalStepTemplates/components/ApprovalStepTemplatesGrid";
import { Pages } from "@/shared/constants/constants";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { Typography } from "@mui/material";
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
      <Typography component="h1" variant="h5" sx={Pages.titleSx}>
        Templates
      </Typography>
      <ApprovalStepTemplatesGrid currentTemplateId={currentTemplateId} />
    </>
  );
};

export default observer(ApprovalStepTemplatesPage);
