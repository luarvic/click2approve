import CopyableCodeField from "@/shared/components/text/CopyableCodeField";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";

interface ReceiptLinkDialogProps {
  linkGlobalId: string;
  onClose: () => void;
}

const ReceiptLinkDialog = ({ linkGlobalId, onClose }: ReceiptLinkDialogProps) => (
  <Dialog fullWidth maxWidth="sm" open onClose={onClose}>
    <DialogTitle>Receipt verification link</DialogTitle>
    <DialogContent dividers>
      <CopyableCodeField
        label="Verification link"
        value={`${window.location.origin}/app/receipt-verification/${linkGlobalId}`}
      />
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Close</Button>
    </DialogActions>
  </Dialog>
);

export default ReceiptLinkDialog;
