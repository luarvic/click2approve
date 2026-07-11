import { stores } from "@/app/rootStore";
import TenantEditor from "@/features/tenants/components/TenantDialog";
import { CreateTenantRequest, EmployeeRole, UpdateTenantRequest } from "@/features/tenants/models/tenant";
import LoadingOverlay from "@/shared/components/overlays/LoadingOverlay";
import { observer } from "mobx-react-lite";
import { Navigate, useNavigate, useParams } from "react-router-dom";

const tenantsPath = "/tenants";

const TenantEditorPage = () => {
  const navigate = useNavigate();
  const { tenantId } = useParams<{ tenantId: string }>();
  const isNewTenant = tenantId === undefined;
  const parsedTenantId = Number(tenantId);
  const tenant = stores.tenantStore.tenants.find((item) => item.id === parsedTenantId);

  if (!stores.userAccountStore.currentUser) return <Navigate to="/signIn" />;
  if (!stores.tenantStore.hasLoaded) return <LoadingOverlay />;
  if (!stores.productStore.tenantsAreEnabled || (!isNewTenant && (!Number.isInteger(parsedTenantId) || !tenant))) return <Navigate to={tenantsPath} />;

  const close = (currentTenantId?: number) => navigate(tenantsPath, { state: currentTenantId ? { currentTenantId } : undefined });
  const submit = async (payload: CreateTenantRequest | UpdateTenantRequest, id?: number) => {
    const saved = id
      ? await stores.tenantStore.update(id, payload as UpdateTenantRequest)
      : await stores.tenantStore.create(payload as CreateTenantRequest);
    if (saved && !id) await stores.refreshTenantScope();
    return saved;
  };

  return <TenantEditor
    tenant={tenant ?? null}
    canEdit={isNewTenant || tenant?.role === EmployeeRole.Admin || tenant?.isOwner === true}
    canDelete={tenant?.isOwner === true}
    onClose={close}
    onDelete={async (id) => {
      const deleted = await stores.tenantStore.delete(id);
      if (deleted) {
        await stores.refreshTenantScope();
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
