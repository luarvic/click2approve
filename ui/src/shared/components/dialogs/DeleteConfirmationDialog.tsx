import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import MainActionButton from "@/shared/components/buttons/MainActionButton";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";

interface DeleteConfirmationDialogProps {
  cancelLabel?: string;
  entityName: string;
  open: boolean;
  title: string;
  onClose: () => void;
  onDelete: () => Promise<boolean>;
}

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  cancelLabel = "Cancel",
  entityName,
  open,
  title,
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
        <DialogContentText>Are you sure you want to delete {entityName}?</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button disabled={deleteAction.isRunning} onClick={onClose}>
          {cancelLabel}
        </Button>
        <MainActionButton color="error" loading={deleteAction.isRunning} onClick={handleDelete}>
          Delete
        </MainActionButton>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmationDialog;
