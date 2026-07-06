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
import {
  DIALOG_FORM_STACK_SPACING,
  DIALOG_TOP_SPACING_SX,
  TENANT_DIALOG_MAX_WIDTH,
} from "../../data/constants";
import { stores } from "../../stores/stores";

const TenantCreateDialog = () => {
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [logo, setLogo] = useState("");

  const close = () => stores.commonStore.setTenantCreateDialogIsOpen(false);

  return (
    <Dialog
      open={stores.commonStore.tenantCreateDialogIsOpen}
      onClose={close}
      fullWidth
      maxWidth={TENANT_DIALOG_MAX_WIDTH}
    >
      <DialogTitle>Create tenant</DialogTitle>
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
        <Button onClick={close}>Cancel</Button>
        <Button
          disabled={!businessName.trim()}
          onClick={async () => {
            const created = await stores.tenantStore.create({
              businessName,
              email: email || undefined,
              phone: phone || undefined,
              address: address || undefined,
              websiteUrl: websiteUrl || undefined,
              logo: logo || undefined,
            });
            if (created) {
              setBusinessName("");
              setEmail("");
              setPhone("");
              setAddress("");
              setWebsiteUrl("");
              setLogo("");
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
