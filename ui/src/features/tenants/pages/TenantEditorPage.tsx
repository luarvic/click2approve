import { stores } from "@/app/rootStore";
import TenantEditor from "@/features/tenants/components/TenantDialog";
import { CreateTenantRequest, EmployeeRole, UpdateTenantRequest } from "@/features/tenants/models/tenant";
import LoadingOverlay from "@/shared/components/overlays/LoadingOverlay";
import { usePageTitle } from "@/shared/hooks/usePageTitle";
import {
  PersistenceSuccessMessages,
  showPersistenceSuccessToast,
} from "@/shared/utils/toasts";
import { observer } from "mobx-react-lite";
import { Navigate, useNavigate, useParams } from "react-router-dom";

const tenantsPath = "/tenants";

const TenantEditorPage = () => {
  const navigate = useNavigate();
  const { tenantGlobalId } = useParams<{ tenantGlobalId: string }>();
  usePageTitle(tenantGlobalId === undefined ? "New organization" : "Edit organization");
  const isNewTenant = tenantGlobalId === undefined;
  const tenant = stores.tenantStore.tenants.find((item) => item.globalId === tenantGlobalId);

  if (!stores.tenantStore.hasLoaded) return <LoadingOverlay />;
  if (!isNewTenant && (!tenant)) return <Navigate to={tenantsPath} />;

  const close = (currentTenantGlobalId?: string) => navigate(tenantsPath, { state: currentTenantGlobalId ? { currentTenantGlobalId } : undefined });
  const submit = async (payload: CreateTenantRequest | UpdateTenantRequest, globalId?: string) => {
    const saved = globalId
      ? await stores.tenantStore.update(globalId, payload as UpdateTenantRequest)
      : await stores.tenantStore.create(payload as CreateTenantRequest);
    if (saved && !globalId) await stores.refreshTenantScope();
    if (saved) {
      showPersistenceSuccessToast(PersistenceSuccessMessages.organizationSaved);
    }
    return saved;
  };

  return <TenantEditor
    tenant={tenant ?? null}
    canEdit={isNewTenant || tenant?.role === EmployeeRole.Admin || tenant?.isOwner === true}
    canDelete={tenant?.isOwner === true}
    onClose={close}
    onDelete={async (globalId: string) => {
      const deleted = await stores.tenantStore.delete(globalId);
      if (deleted) {
        await stores.refreshTenantScope();
        showPersistenceSuccessToast(
          PersistenceSuccessMessages.organizationDeleted,
        );
        navigate(tenantsPath);
      }
      return deleted;
    }}
    onSubmit={submit}
    onLogoUpload={stores.tenantStore.uploadLogo}
    onLogoDelete={stores.tenantStore.deleteLogo}
  />;
};

export default observer(TenantEditorPage);
