import TenantLogoPicker from "@/features/tenants/components/TenantLogoPicker";
import { CreateTenantRequest, Tenant, UpdateTenantRequest } from "@/features/tenants/models/tenant";
import { Dialogs } from "@/shared/constants/constants";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";

interface TenantDialogProps {
  open: boolean;
  tenant?: Tenant | null;
  onClose: () => void;
  onSubmit: (
    payload: CreateTenantRequest | UpdateTenantRequest,
    tenantId?: number,
  ) => Promise<Tenant | null>;
  onLogoUpload: (tenantId: number, logo: File) => Promise<boolean>;
  onLogoDelete: (tenantId: number) => Promise<boolean>;
}

const TenantDialog: React.FC<TenantDialogProps> = ({
  open,
  tenant,
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
    if (open) {
      reset();
    }
  }, [open, reset]);

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

    onClose();
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
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={Dialogs.tenantMaxWidth}
    >
      <DialogTitle>
        {tenant ? "Edit organization" : "New organization"}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={Dialogs.formStackSpacing} sx={Dialogs.topSpacingSx}>
          <TextField
            label="Business name"
            required
            value={businessName}
            onChange={(event) => setBusinessName(event.target.value)}
          />
          <TextField
            label="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <TextField
            label="Phone"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />
          <TextField
            label="Address"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
          />
          <TextField
            label="Website URL"
            value={websiteUrl}
            onChange={(event) => setWebsiteUrl(event.target.value)}
          />
          <TenantLogoPicker
            logoUrl={logoWasRemoved ? undefined : tenant?.logo}
            selectedFile={logoFile}
            onSelect={handleLogoSelect}
            onRemove={handleLogoRemove}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button disabled={!businessName.trim()} onClick={handleSubmit}>
          {tenant ? "Save" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TenantDialog;
