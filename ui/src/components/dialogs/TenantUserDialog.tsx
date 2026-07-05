import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";
import { EMAIL_VALIDATION_REGEX } from "../../data/constants";
import { TenantUserRole } from "../../models/tenant";
import {
  ITenantUser,
  ITenantUserCreate,
  ITenantUserUpdate,
} from "../../models/tenantUser";

interface ITenantUserDialogProps {
  open: boolean;
  tenantUser: ITenantUser | null;
  onClose: () => void;
  onSubmit: (
    payload: ITenantUserCreate | ITenantUserUpdate,
    tenantUserId?: number
  ) => Promise<boolean>;
}

const roleOptions = [
  { label: "User", value: TenantUserRole.User },
  { label: "Manager", value: TenantUserRole.Manager },
  { label: "Admin", value: TenantUserRole.Admin },
];

const TenantUserDialog: React.FC<ITenantUserDialogProps> = ({
  open,
  tenantUser,
  onClose,
  onSubmit,
}) => {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [position, setPosition] = useState("");
  const [role, setRole] = useState(TenantUserRole.User);
  const [emailTouched, setEmailTouched] = useState(false);
  const isEdit = tenantUser !== null;
  const emailHasError =
    !isEdit && emailTouched && !EMAIL_VALIDATION_REGEX.test(email);

  useEffect(() => {
    if (!open) {
      return;
    }

    setEmail(tenantUser?.email ?? "");
    setFirstName(tenantUser?.firstName ?? "");
    setLastName(tenantUser?.lastName ?? "");
    setPosition(tenantUser?.position ?? "");
    setRole(tenantUser?.role ?? TenantUserRole.User);
    setEmailTouched(false);
  }, [open, tenantUser]);

  const handleSubmit = async () => {
    if (!isEdit && !EMAIL_VALIDATION_REGEX.test(email)) {
      setEmailTouched(true);
      return;
    }

    const payload = {
      firstName: firstName.trim() || undefined,
      lastName: lastName.trim() || undefined,
      position: position.trim() || undefined,
      role,
    };
    const saved = isEdit
      ? await onSubmit(payload, tenantUser.id)
      : await onSubmit({ ...payload, email: email.trim() });

    if (saved) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEdit ? "Edit tenant user" : "Add tenant user"}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            label="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            onBlur={() => setEmailTouched(true)}
            disabled={isEdit}
            error={emailHasError}
            helperText={emailHasError ? "Enter a valid email address." : " "}
            fullWidth
            required
          />
          <TextField
            label="First name"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            fullWidth
          />
          <TextField
            label="Last name"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            fullWidth
          />
          <TextField
            label="Position"
            value={position}
            onChange={(event) => setPosition(event.target.value)}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel id="tenant-user-role-label">Role</InputLabel>
            <Select
              labelId="tenant-user-role-label"
              label="Role"
              value={role}
              onChange={(event) => setRole(Number(event.target.value))}
            >
              {roleOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TenantUserDialog;
