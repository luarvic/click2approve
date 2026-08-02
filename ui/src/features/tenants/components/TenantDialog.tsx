import TenantLogoPicker from "@/features/tenants/components/TenantLogoPicker";
import { CreateTenantRequest, Tenant, UpdateTenantRequest } from "@/features/tenants/models/tenant";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import { Dialogs } from "@/shared/constants/constants";
import {
  Button,
  Stack,
  TextField,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";

interface TenantDialogProps {
  canEdit: boolean;
  tenant?: Tenant | null;
  onClose: (currentTenantGlobalId?: string) => void;
  onSubmit: (
    payload: CreateTenantRequest | UpdateTenantRequest,
    tenantGlobalId?: string,
  ) => Promise<Tenant | null>;
  onLogoUpload: (tenantGlobalId: string, logo: File) => Promise<boolean>;
  onLogoDelete: (tenantGlobalId: string) => Promise<boolean>;
}

const TenantDialog: React.FC<TenantDialogProps> = ({
  tenant,
  canEdit,
  onClose,
  onSubmit,
  onLogoUpload,
  onLogoDelete,
}) => {
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoWasRemoved, setLogoWasRemoved] = useState(false);
  const isNew = !tenant;

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
  };

  const handleLogoSelect = (file: File | null) => {
    setLogoFile(file);
    setLogoWasRemoved(false);
  };

  const handleLogoRemove = () => {
    setLogoFile(null);
    setLogoWasRemoved(Boolean(tenant?.logo));
  };

  return (
    <>
      <PageBreadcrumbs
        items={[
          {
            label: "Organizations",
            state: tenant ? { currentTenantGlobalId: tenant.globalId } : undefined,
            to: "/tenants",
          },
          { label: isNew ? "New organization" : "Organization" },
        ]}
      />
      <Stack spacing={Dialogs.formStackSpacing}>
        <TenantLogoPicker
          logoUrl={logoWasRemoved ? undefined : tenant?.logo}
          selectedFile={logoFile}
          onSelect={handleLogoSelect}
          onRemove={handleLogoRemove}
          disabled={!isNew && !canEdit}
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
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={Dialogs.stepHeaderSpacing}
        sx={Dialogs.addStepButtonSx}
      >
        <Button variant="outlined" onClick={() => onClose(tenant?.globalId)}>
          Cancel
        </Button>
        {(isNew || canEdit) && (
          <Button
            variant="outlined"
            disabled={!businessName.trim()}
            onClick={handleSubmit}
          >
            Save
          </Button>
        )}
      </Stack>
    </>
  );
};

export default TenantDialog;
