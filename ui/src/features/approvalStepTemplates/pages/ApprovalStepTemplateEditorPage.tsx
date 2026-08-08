import { stores } from "@/app/rootStore";
import ApprovalStepTemplateEditor from "@/features/approvalStepTemplates/components/ApprovalStepTemplateDialog";
import { TenantType } from "@/features/tenants/models/tenant";
import LoadingOverlay from "@/shared/components/overlays/LoadingOverlay";
import { Routes } from "@/shared/constants/constants";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import NotFoundPage from "@/shared/pages/NotFoundPage";
import {
  PersistenceSuccessMessages,
  showPersistenceSuccessNotification,
} from "@/shared/utils/persistenceNotifications";
import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";

const ApprovalStepTemplateEditorPage = () => {
  const navigate = useNavigate();
  const { templateGlobalId } = useParams<{ templateGlobalId: string }>();
  usePageTitle(templateGlobalId === undefined ? "New template" : "Edit template");
  const [hasLoadedTemplates, setHasLoadedTemplates] = useState(false);
  const currentTenant = stores.tenantStore.currentTenant;
  const tenantGlobalId = stores.tenantStore.currentTenantGlobalId;
  const templatesPath = tenantGlobalId
    ? Routes.tenantPath(tenantGlobalId, "/approvalStepTemplates")
    : "/";
  const canViewTemplates =
    stores.applicationConfigurationStore.approvalStepTemplatesAreEnabled &&
    currentTenant?.type === TenantType.Business &&
    currentTenant.currentEmployeeRole !== undefined;
  const isNewTemplate = templateGlobalId === undefined;
  const template = stores.approvalStepTemplateStore.templates.find(
    (item) => item.globalId === templateGlobalId,
  );

  useEffect(() => {
    if (isNewTemplate) {
      setHasLoadedTemplates(true);
      return;
    }
    if (!tenantGlobalId) {
      return;
    }

    setHasLoadedTemplates(false);
    stores.approvalStepTemplateStore.load(tenantGlobalId).finally(() => {
      setHasLoadedTemplates(true);
    });
  }, [isNewTemplate, tenantGlobalId]);

  if (!stores.tenantStore.hasLoaded) {
    return <LoadingOverlay />;
  }

  if (
    !canViewTemplates ||
    (!isNewTemplate && templateGlobalId === undefined)
  ) {
    return <Navigate to={templatesPath} />;
  }

  if (!isNewTemplate && !hasLoadedTemplates) {
    return <LoadingOverlay />;
  }

  if (!isNewTemplate && !template) {
    return <NotFoundPage />;
  }

  return (
    <ApprovalStepTemplateEditor
      template={template ?? null}
      onClose={(currentTemplateGlobalId) =>
        navigate(templatesPath, {
          state: currentTemplateGlobalId
            ? { currentTemplateGlobalId }
            : undefined,
        })
      }
      onDelete={async  (id: string) => {
        const deleted = tenantGlobalId
          ? await stores.approvalStepTemplateStore.delete(tenantGlobalId, id)
          : false;
        if (deleted) {
          showPersistenceSuccessNotification(
            PersistenceSuccessMessages.templateDeleted,
          );
          navigate(templatesPath);
        }
        return deleted;
      }}
    />
  );
};

export default observer(ApprovalStepTemplateEditorPage);
