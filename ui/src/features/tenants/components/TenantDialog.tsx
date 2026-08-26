import { stores } from "@/app/rootStore";
import { CreateTenantRequest, Tenant, UpdateTenantRequest } from "@/features/tenants/models/tenant";
import ImagePicker from "@/shared/components/images/ImagePicker";
import MainActionButton from "@/shared/components/buttons/MainActionButton";
import CloseOnEscape from "@/shared/components/navigation/CloseOnEscape";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import { Dialogs } from "@/shared/constants/constants";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
import { Business } from "@mui/icons-material";
import { Button, Stack, TextField } from "@mui/material";
import { useCallback, useEffect, useState } from "react";

interface TenantDialogProps {
  canEdit: boolean;
  canScheduleDeletion: boolean;
  tenant?: Tenant | null;
  onClose: (currentTenantGlobalId?: string) => void;
  onSubmit: (payload: CreateTenantRequest | UpdateTenantRequest, tenantGlobalId?: string) => Promise<Tenant | null>;
  onLogoUpload: (tenantGlobalId: string, logo: File) => Promise<boolean>;
  onLogoDelete: (tenantGlobalId: string) => Promise<boolean>;
  onScheduleDeletion: () => void;
}

const TenantDialog: React.FC<TenantDialogProps> = ({
  tenant,
  canEdit,
  canScheduleDeletion,
  onClose,
  onSubmit,
  onLogoUpload,
  onLogoDelete,
  onScheduleDeletion,
}) => {
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoWasRemoved, setLogoWasRemoved] = useState(false);
  const saveLoader = ActionLoaders.tenants.save(tenant?.globalId);
  const saveAction = useAsyncAction(saveLoader);
  const isNew = !tenant;
  const saveIsLoading = saveAction.isRunning;

  const reset = useCallback(() => {
    setBusinessName(tenant?.businessName ?? "");
    setEmail(tenant?.email ?? "");
    setPhone(tenant?.phone ?? "");
    setAddress(tenant?.address ?? "");
    setWebsiteUrl(tenant?.websiteUrl ?? "");
    setLogoFile(null);
    setLogoWasRemoved(false);
  }, [tenant]);

  useEffect(() => {
    reset();
  }, [reset]);

  const handleSubmit = async () => {
    await saveAction.run(async () => {
      const savedTenant = await onSubmit(
        {
          businessName: businessName.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          address: address.trim() || undefined,
          websiteUrl: websiteUrl.trim() || undefined,
        },
        tenant?.globalId,
      );

      if (!savedTenant) {
        return;
      }

      if (logoWasRemoved) {
        const deleted = await onLogoDelete(savedTenant.globalId);
        if (!deleted) {
          return;
        }
      }

      if (logoFile) {
        const uploaded = await onLogoUpload(savedTenant.globalId, logoFile);
        if (!uploaded) {
          return;
        }
      }

      onClose(savedTenant.globalId);
    });
  };

  const handleLogoSelect = (file: File) => {
    setLogoFile(file);
    setLogoWasRemoved(false);
  };

  const handleLogoRemove = () => {
    setLogoFile(null);
    setLogoWasRemoved(Boolean(tenant?.logo));
  };

  return (
    <CloseOnEscape onClose={() => onClose(tenant?.globalId)}>
      <PageBreadcrumbs
        items={[
          {
            label: "Organizations",
            state: tenant ? { currentTenantGlobalId: tenant.globalId } : undefined,
            to: "/tenants",
          },
          { label: tenant?.businessName ?? "New organization" },
        ]}
      />
      <Stack spacing={Dialogs.formStackSpacing}>
        <ImagePicker
          alt="Organization logo"
          fallback={<Business fontSize="large" />}
          imageSize={stores.applicationConfigurationStore.applicationConfiguration?.logoImageSize ?? 256}
          imageUrl={logoWasRemoved ? undefined : tenant?.logo}
          selectedFile={logoFile}
          disabled={!isNew && !canEdit}
          onDelete={handleLogoRemove}
          onSave={handleLogoSelect}
          title="Edit logo"
        />
        <TextField
          label="Business name"
          required
          value={businessName}
          onChange={(event) => setBusinessName(event.target.value)}
          disabled={!isNew && !canEdit}
        />
        <TextField
          label="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={!isNew && !canEdit}
        />
        <TextField
          label="Phone"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          disabled={!isNew && !canEdit}
        />
        <TextField
          label="Address"
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          disabled={!isNew && !canEdit}
        />
        <TextField
          label="Website URL"
          value={websiteUrl}
          onChange={(event) => setWebsiteUrl(event.target.value)}
          disabled={!isNew && !canEdit}
        />
      </Stack>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={Dialogs.stepHeaderSpacing} sx={Dialogs.addStepButtonSx}>
        <Button variant="outlined" onClick={() => onClose(tenant?.globalId)}>
          Cancel
        </Button>
        {!isNew && canScheduleDeletion && (
          <Button color="error" disabled={saveIsLoading} variant="outlined" onClick={onScheduleDeletion}>
            Schedule deletion
          </Button>
        )}
        {(isNew || canEdit) && (
          <MainActionButton disabled={!businessName.trim()} loading={saveIsLoading} onClick={handleSubmit}>
            Save
          </MainActionButton>
        )}
      </Stack>
    </CloseOnEscape>
  );
};

export default TenantDialog;
