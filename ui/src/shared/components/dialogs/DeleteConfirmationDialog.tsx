import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
import LoadingButton from "@mui/lab/LoadingButton";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";

interface DeleteConfirmationDialogProps {
  cancelFirst?: boolean;
  cancelLabel?: string;
  entityName: string;
  open: boolean;
  title: string;
  onClose: () => void;
  onDelete: () => Promise<boolean>;
}

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  cancelFirst = false,
  cancelLabel = "Close",
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
        {cancelFirst && (
          <Button disabled={deleteAction.isRunning} onClick={onClose}>
            {cancelLabel}
          </Button>
        )}
        <LoadingButton color="error" loading={deleteAction.isRunning} onClick={handleDelete}>
          Delete
        </LoadingButton>
        {!cancelFirst && (
          <Button disabled={deleteAction.isRunning} onClick={onClose}>
            {cancelLabel}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmationDialog;
