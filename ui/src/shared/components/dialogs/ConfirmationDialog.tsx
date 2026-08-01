import type { ButtonProps } from "@mui/material";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

interface ConfirmationDialogProps {
  cancelFirst?: boolean;
  cancelLabel?: string;
  confirmColor?: ButtonProps["color"];
  confirmDisabled?: boolean;
  confirmLabel: string;
  message: string;
  open: boolean;
  title: string;
  onClose: () => void;
  onConfirm: () => Promise<boolean>;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  cancelFirst = false,
  cancelLabel = "Close",
  confirmColor = "primary",
  confirmDisabled = false,
  confirmLabel,
  message,
  open,
  title,
  onClose,
  onConfirm,
}) => {
  const handleConfirm = async () => {
    if (await onConfirm()) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        <DialogContentText>
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        {cancelFirst && <Button variant="outlined" onClick={onClose}>{cancelLabel}</Button>}
        <Button
          color={confirmColor}
          disabled={confirmDisabled}
          variant="outlined"
          onClick={handleConfirm}
        >
          {confirmLabel}
        </Button>
        {!cancelFirst && <Button variant="outlined" onClick={onClose}>{cancelLabel}</Button>}
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;
