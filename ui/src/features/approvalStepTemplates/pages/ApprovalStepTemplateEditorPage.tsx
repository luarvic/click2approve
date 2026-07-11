import { stores } from "@/app/rootStore";
import ApprovalStepTemplateEditor from "@/features/approvalStepTemplates/components/ApprovalStepTemplateDialog";
import { TenantType } from "@/features/tenants/models/tenant";
import LoadingOverlay from "@/shared/components/overlays/LoadingOverlay";
import { Routes } from "@/shared/constants/constants";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";

const ApprovalStepTemplateEditorPage = () => {
  const navigate = useNavigate();
  const { templateId } = useParams<{ templateId: string }>();
  const [hasLoadedTemplates, setHasLoadedTemplates] = useState(false);
  const currentTenant = stores.tenantStore.currentTenant;
  const tenantId = stores.tenantStore.currentTenantId;
  const templatesPath = tenantId
    ? Routes.tenantPath(tenantId, "/approvalStepTemplates")
    : "/";
  const canViewTemplates =
    stores.productStore.approvalStepTemplatesAreEnabled &&
    currentTenant?.type === TenantType.Business &&
    currentTenant.role !== undefined;
  const isNewTemplate = templateId === undefined;
  const parsedTemplateId = Number(templateId);
  const template = stores.approvalStepTemplateStore.templates.find(
    (item) => item.id === parsedTemplateId,
  );

  useEffect(() => {
    if (isNewTemplate) {
      setHasLoadedTemplates(true);
      return;
    }
    if (!tenantId) {
      return;
    }

    setHasLoadedTemplates(false);
    stores.approvalStepTemplateStore.load(tenantId).finally(() => {
      setHasLoadedTemplates(true);
    });
  }, [isNewTemplate, tenantId]);

  if (!stores.userAccountStore.currentUser) {
    return <Navigate to="/signIn" />;
  }

  if (!stores.tenantStore.hasLoaded) {
    return <LoadingOverlay />;
  }

  if (
    !canViewTemplates ||
    (!isNewTemplate && !Number.isInteger(parsedTemplateId))
  ) {
    return <Navigate to={templatesPath} />;
  }

  if (!isNewTemplate && !hasLoadedTemplates) {
    return <LoadingOverlay />;
  }

  if (!isNewTemplate && !template) {
    return <Navigate to={templatesPath} />;
  }

  return (
    <ApprovalStepTemplateEditor
      template={template ?? null}
      onClose={(currentTemplateId) =>
        navigate(templatesPath, {
          state: currentTemplateId
            ? { currentTemplateId }
            : undefined,
        })
      }
      onDelete={async (id) => {
        const deleted = tenantId
          ? await stores.approvalStepTemplateStore.delete(tenantId, id)
          : false;
        if (deleted) {
          navigate(templatesPath);
        }
        return deleted;
      }}
    />
  );
};

export default observer(ApprovalStepTemplateEditorPage);
