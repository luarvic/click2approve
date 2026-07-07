import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";
import {
  DIALOG_FORM_STACK_SPACING,
  DIALOG_TOP_SPACING_SX,
  TENANT_DIALOG_MAX_WIDTH,
} from "../../data/constants";
import { ITenant, ITenantCreate, ITenantUpdate } from "../../models/tenant";

interface ITenantDialogProps {
  open: boolean;
  tenant?: ITenant | null;
  onClose: () => void;
  onSubmit: (
    payload: ITenantCreate | ITenantUpdate,
    tenantId?: number
  ) => Promise<boolean>;
}

const TenantDialog: React.FC<ITenantDialogProps> = ({
  open,
  tenant,
  onClose,
  onSubmit,
}) => {
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [logo, setLogo] = useState("");

  const reset = () => {
    setBusinessName(tenant?.businessName ?? "");
    setEmail(tenant?.email ?? "");
    setPhone(tenant?.phone ?? "");
    setAddress(tenant?.address ?? "");
    setWebsiteUrl(tenant?.websiteUrl ?? "");
    setLogo(tenant?.logo ?? "");
  };

  useEffect(() => {
    if (open) {
      reset();
    }
  }, [open, tenant]);

  const handleSubmit = async () => {
    const saved = await onSubmit(
      {
        businessName: businessName.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        websiteUrl: websiteUrl.trim() || undefined,
        logo: logo.trim() || undefined,
      },
      tenant?.id
    );
    if (saved) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={TENANT_DIALOG_MAX_WIDTH}
    >
      <DialogTitle>
        {tenant ? "Edit organization" : "New organization"}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={DIALOG_FORM_STACK_SPACING} sx={DIALOG_TOP_SPACING_SX}>
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
          <TextField
            label="Logo"
            value={logo}
            onChange={(event) => setLogo(event.target.value)}
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
