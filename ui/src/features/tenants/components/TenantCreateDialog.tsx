import { stores } from "@/app/stores";
import TenantLogoPicker from "@/features/tenants/components/TenantLogoPicker";
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
import { observer } from "mobx-react-lite";
import { useState } from "react";

const TenantCreateDialog = () => {
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const close = () => stores.commonStore.setTenantCreateDialogIsOpen(false);

  return (
    <Dialog
      open={stores.commonStore.tenantCreateDialogIsOpen}
      onClose={close}
      fullWidth
      maxWidth={Dialogs.tenantMaxWidth}
    >
      <DialogTitle>Create tenant</DialogTitle>
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
            selectedFile={logoFile}
            onSelect={setLogoFile}
            onRemove={() => setLogoFile(null)}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={close}>Cancel</Button>
        <Button
          disabled={!businessName.trim()}
          onClick={async () => {
            const payload = {
              businessName,
              email: email || undefined,
              phone: phone || undefined,
              address: address || undefined,
              websiteUrl: websiteUrl || undefined,
            };
            const created = logoFile
              ? await stores.tenantStore.createWithLogo(payload, logoFile)
              : await stores.tenantStore.create(payload);
            if (created) {
              setBusinessName("");
              setEmail("");
              setPhone("");
              setAddress("");
              setWebsiteUrl("");
              setLogoFile(null);
              close();
            }
          }}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default observer(TenantCreateDialog);
