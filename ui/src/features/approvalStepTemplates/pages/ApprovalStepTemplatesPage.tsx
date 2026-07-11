import { stores } from "@/app/rootStore";
import ApprovalStepTemplatesGrid from "@/features/approvalStepTemplates/components/ApprovalStepTemplatesGrid";
import { TenantType } from "@/features/tenants/models/tenant";
import { Pages } from "@/shared/constants/constants";
import { Typography } from "@mui/material";
import { observer } from "mobx-react-lite";
import { Navigate, useLocation } from "react-router-dom";

interface ApprovalStepTemplatesLocationState {
  currentTemplateId?: number;
}

const ApprovalStepTemplatesPage = () => {
  const location = useLocation();
  const currentTenant = stores.tenantStore.currentTenant;
  const { currentTemplateId } =
    (location.state as ApprovalStepTemplatesLocationState | null) ?? {};
  const canViewTemplates =
    stores.productStore.approvalStepTemplatesAreEnabled &&
    currentTenant?.type === TenantType.Business &&
    currentTenant?.role !== undefined;

  if (!stores.userAccountStore.currentUser) {
    return <Navigate to="/signIn" />;
  }

  if (!canViewTemplates) {
    return <Navigate to="/" />;
  }

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
