import TenantLogoPicker from "@/features/tenants/components/TenantLogoPicker";
import { CreateTenantRequest, Tenant, UpdateTenantRequest } from "@/features/tenants/models/tenant";
import DeleteConfirmationDialog from "@/shared/components/dialogs/DeleteConfirmationDialog";
import { Dialogs, Pages } from "@/shared/constants/constants";
import {
  Button,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";

interface TenantDialogProps {
  canDelete: boolean;
  canEdit: boolean;
  tenant?: Tenant | null;
  onClose: (currentTenantId?: number) => void;
  onDelete: (tenantId: number) => Promise<boolean>;
  onSubmit: (
    payload: CreateTenantRequest | UpdateTenantRequest,
    tenantId?: number,
  ) => Promise<Tenant | null>;
  onLogoUpload: (tenantId: number, logo: File) => Promise<boolean>;
  onLogoDelete: (tenantId: number) => Promise<boolean>;
}

const TenantDialog: React.FC<TenantDialogProps> = ({
  tenant,
  canDelete,
  canEdit,
  onClose,
  onDelete,
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
  const [deleteDialogIsOpen, setDeleteDialogIsOpen] = useState(false);
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
      tenant?.id,
    );

    if (!savedTenant) {
      return;
    }

    if (logoWasRemoved) {
      const deleted = await onLogoDelete(savedTenant.id);
      if (!deleted) {
        return;
      }
    }

    if (logoFile) {
      const uploaded = await onLogoUpload(savedTenant.id, logoFile);
      if (!uploaded) {
        return;
      }
    }

    onClose(savedTenant.id);
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
      <Typography component="h1" variant="h5" sx={Pages.titleSx}>
        {isNew ? "New organization" : "Organization"}
      </Typography>
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
        <Button variant="outlined" onClick={() => onClose(tenant?.id)}>
          Cancel
        </Button>
        {!isNew && canDelete && (
          <Button
            color="error"
            variant="outlined"
            onClick={() => setDeleteDialogIsOpen(true)}
          >
            Delete
          </Button>
        )}
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
      {tenant && (
        <DeleteConfirmationDialog
          entityName={tenant.businessName}
          open={deleteDialogIsOpen}
          title="Delete organization"
          onClose={() => setDeleteDialogIsOpen(false)}
          onDelete={() => onDelete(tenant.id)}
        />
      )}
    </>
  );
};

export default TenantDialog;
