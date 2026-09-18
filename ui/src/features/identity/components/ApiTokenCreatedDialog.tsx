import { Forms } from "@/shared/components/dialogs/formStyles";
import CopyableCodeField from "@/shared/components/text/CopyableCodeField";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Stack } from "@mui/material";

interface ApiTokenCreatedDialogProps {
  open: boolean;
  value: string | null;
  onClose: () => void;
}

const ApiTokenCreatedDialog: React.FC<ApiTokenCreatedDialogProps> = ({ open, value, onClose }) => {
  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose}>
      <DialogTitle>Copy your API token</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={Forms.formStackSpacing}>
          <DialogContentText>
            For your security, this token will not be shown again after you close this dialog.
          </DialogContentText>
          <CopyableCodeField label="API token" value={value ?? ""} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} type="button">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ApiTokenCreatedDialog;
