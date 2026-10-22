import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import MainActionButton from "@/shared/components/buttons/MainActionButton";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
import type { ButtonProps } from "@mui/material";
import type { ReactNode } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";

interface ConfirmationDialogProps {
  cancelLabel?: string;
  confirmColor?: ButtonProps["color"];
  confirmDisabled?: boolean;
  confirmLabel: string;
  message: ReactNode;
  open: boolean;
  title: string;
  onClose: () => void;
  onConfirm: () => Promise<boolean>;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  cancelLabel = "Cancel",
  confirmColor = "primary",
  confirmDisabled = false,
  confirmLabel,
  message,
  open,
  title,
  onClose,
  onConfirm,
}) => {
  const confirmAction = useAsyncAction(ActionLoaders.dialogs.confirm());

  const handleConfirm = async () => {
    await confirmAction.run(async () => {
      if (await onConfirm()) {
        onClose();
      }
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button disabled={confirmAction.isRunning} onClick={onClose}>
          {cancelLabel}
        </Button>
        <MainActionButton
          color={confirmColor}
          disabled={confirmDisabled}
          loading={confirmAction.isRunning}
          onClick={handleConfirm}
        >
          {confirmLabel}
        </MainActionButton>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;
