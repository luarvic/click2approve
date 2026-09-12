import MainActionButton from "@/shared/components/buttons/MainActionButton";
import { Forms } from "@/shared/components/dialogs/formStyles";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Stack } from "@mui/material";
import type { ReactNode } from "react";

interface DeleteConfirmationDialogProps {
  actionLabel?: string;
  cancelLabel?: string;
  entityName: ReactNode;
  open: boolean;
  title: string;
  warning?: ReactNode;
  onClose: () => void;
  onDelete: () => Promise<boolean>;
}

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  actionLabel = "Delete",
  cancelLabel = "Cancel",
  entityName,
  open,
  title,
  warning,
  onClose,
  onDelete,
}) => {
  const deleteAction = useAsyncAction(ActionLoaders.dialogs.delete());

  const handleDelete = async () => {
    await deleteAction.run(async () => {
      if (await onDelete()) {
        onClose();
      }
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={Forms.formStackSpacing}>
          <DialogContentText>
            Are you sure you want to {actionLabel.toLocaleLowerCase()} {entityName}?
          </DialogContentText>
          {warning && <DialogContentText>{warning}</DialogContentText>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button disabled={deleteAction.isRunning} onClick={onClose}>
          {cancelLabel}
        </Button>
        <MainActionButton color="error" loading={deleteAction.isRunning} onClick={handleDelete}>
          {actionLabel}
        </MainActionButton>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmationDialog;
