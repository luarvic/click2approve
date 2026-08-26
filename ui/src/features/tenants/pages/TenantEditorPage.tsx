import { stores } from "@/app/rootStore";
import TenantEditor from "@/features/tenants/components/TenantDialog";
import { CreateTenantRequest, EmployeeRole, UpdateTenantRequest } from "@/features/tenants/models/tenant";
import DeleteConfirmationDialog from "@/shared/components/dialogs/DeleteConfirmationDialog";
import NarrowContent from "@/shared/components/layout/NarrowContent";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import NotFoundPage from "@/shared/pages/NotFoundPage";
import {
  PersistenceSuccessMessages,
  showPersistenceSuccessNotification,
} from "@/shared/utils/persistenceNotifications";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const tenantsPath = "/tenants";

const TenantEditorPage = () => {
  const navigate = useNavigate();
  const { tenantGlobalId } = useParams<{ tenantGlobalId: string }>();
  usePageTitle(tenantGlobalId === undefined ? "New organization" : "Edit organization");
  const isNewTenant = tenantGlobalId === undefined;
  const [scheduleDeletionIsOpen, setScheduleDeletionIsOpen] = useState(false);
  const tenant = stores.tenantStore.tenants.find((item) => item.globalId === tenantGlobalId);

  if (!stores.tenantStore.hasLoaded) return null;
  if (!isNewTenant && !tenant) return <NotFoundPage />;

  const close = (currentTenantGlobalId?: string) =>
    navigate(tenantsPath, {
      state: currentTenantGlobalId ? { currentTenantGlobalId } : undefined,
    });
  const submit = async (payload: CreateTenantRequest | UpdateTenantRequest, globalId?: string) => {
    const saved = globalId
      ? await stores.tenantStore.update(globalId, payload as UpdateTenantRequest)
      : await stores.tenantStore.create(payload as CreateTenantRequest);
    if (saved && !globalId) await stores.refreshTenantScope();
    if (saved) {
      showPersistenceSuccessNotification(PersistenceSuccessMessages.organizationSaved);
    }
    return saved;
  };

  const scheduleDeletion = async () => {
    if (!tenant || !(await stores.tenantStore.scheduleDeletion(tenant.globalId))) {
      return false;
    }

    await stores.userProfileStore.load();
    navigate(tenantsPath);
    return true;
  };

  return (
    <NarrowContent>
      <TenantEditor
        tenant={tenant ?? null}
        canEdit={
          isNewTenant ||
          tenant?.currentEmployeeRole === EmployeeRole.Admin ||
          tenant?.currentEmployeeRole === EmployeeRole.Owner
        }
        onClose={close}
        onSubmit={submit}
        onLogoUpload={stores.tenantStore.uploadLogo}
        onLogoDelete={stores.tenantStore.deleteLogo}
        onScheduleDeletion={() => setScheduleDeletionIsOpen(true)}
        canScheduleDeletion={tenant?.currentEmployeeRole === EmployeeRole.Owner}
      />
      <DeleteConfirmationDialog
        entityName={tenant?.businessName ?? "this organization"}
        open={scheduleDeletionIsOpen}
        title="Delete organization"
        warning="All organization data, including its requests, tasks, templates, employees, teams, and files, will be permanently deleted. This action cannot be undone."
        onClose={() => setScheduleDeletionIsOpen(false)}
        onDelete={scheduleDeletion}
      />
    </NarrowContent>
  );
};

export default observer(TenantEditorPage);
