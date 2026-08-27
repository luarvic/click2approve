import { stores } from "@/app/rootStore";
import { getApprovalStepTemplate } from "@/features/approvalStepTemplates/api/approvalStepTemplatesApi";
import ApprovalStepTemplateEditor from "@/features/approvalStepTemplates/components/ApprovalStepTemplateDialog";
import { ApprovalStepTemplate } from "@/features/approvalStepTemplates/models/approvalStepTemplate";
import { TenantType } from "@/features/tenants/models/tenant";
import NarrowContent from "@/shared/components/layout/NarrowContent";
import { Routes } from "@/shared/constants/constants";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import NotFoundPage from "@/shared/pages/NotFoundPage";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
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
  const [hasLoadedTemplate, setHasLoadedTemplate] = useState(false);
  const [template, setTemplate] = useState<ApprovalStepTemplate | null>(null);
  const currentTenant = stores.tenantStore.currentTenant;
  const tenantGlobalId = stores.tenantStore.currentTenantGlobalId;
  const templatesPath = tenantGlobalId ? Routes.tenantPath(tenantGlobalId, "/approvalStepTemplates") : "/";
  const canViewTemplates =
    stores.applicationConfigurationStore.approvalStepTemplatesAreEnabled &&
    currentTenant?.type === TenantType.Business &&
    currentTenant.currentEmployeeRole !== undefined;
  const isNewTemplate = templateGlobalId === undefined;

  useEffect(() => {
    if (isNewTemplate) {
      setHasLoadedTemplate(true);
      setTemplate(null);
      return;
    }
    if (!tenantGlobalId) {
      return;
    }

    const loader = ActionLoaders.pages.approvalStepTemplateEditor(templateGlobalId);
    setHasLoadedTemplate(false);
    setTemplate(null);
    stores.commonStore.updateActionLoadingCounter(loader, 1);
    void getApprovalStepTemplate(tenantGlobalId, templateGlobalId)
      .then((loadedTemplate) => {
        setTemplate(loadedTemplate);
      })
      .finally(() => {
        stores.commonStore.updateActionLoadingCounter(loader, -1);
        setHasLoadedTemplate(true);
      });
  }, [isNewTemplate, templateGlobalId, tenantGlobalId]);

  if (!stores.tenantStore.hasLoaded) {
    return null;
  }

  if (!canViewTemplates || (!isNewTemplate && templateGlobalId === undefined)) {
    return <Navigate to={templatesPath} />;
  }

  if (!isNewTemplate && !hasLoadedTemplate) {
    return null;
  }

  if (!isNewTemplate && !template) {
    return <NotFoundPage />;
  }

  return (
    <NarrowContent>
      <ApprovalStepTemplateEditor
        template={template ?? null}
        onClose={(currentTemplateGlobalId) =>
          navigate(templatesPath, {
            state: currentTemplateGlobalId ? { currentTemplateGlobalId } : undefined,
          })
        }
        onDelete={async (id: string) => {
          const deleted = tenantGlobalId ? await stores.approvalStepTemplateStore.delete(tenantGlobalId, id) : false;
          if (deleted) {
            showPersistenceSuccessNotification(PersistenceSuccessMessages.templateDeleted);
            navigate(templatesPath);
          }
          return deleted;
        }}
      />
    </NarrowContent>
  );
};

export default observer(ApprovalStepTemplateEditorPage);
