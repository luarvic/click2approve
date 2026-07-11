import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

interface DeleteConfirmationDialogProps {
  cancelFirst?: boolean;
  cancelLabel?: string;
  entityName: string;
  open: boolean;
  title: string;
  onClose: () => void;
  onDelete: () => Promise<boolean>;
}

const DeleteConfirmationDialog: React.FC<
  DeleteConfirmationDialogProps
> = ({
  cancelFirst = false,
  cancelLabel = "Close",
  entityName,
  open,
  title,
  onClose,
  onDelete,
}) => {
    const handleDelete = async () => {
      if (await onDelete()) {
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
            Are you sure you want to delete {entityName}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          {cancelFirst && <Button onClick={onClose}>{cancelLabel}</Button>}
          <Button color="error" onClick={handleDelete}>
            Delete
          </Button>
          {!cancelFirst && <Button onClick={onClose}>{cancelLabel}</Button>}
        </DialogActions>
      </Dialog>
    );
  };

export default DeleteConfirmationDialog;
