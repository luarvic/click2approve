import type { NotificationDetail } from "@/shared/utils/notifications";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";

interface NotificationDetailsDialogProps {
  details: NotificationDetail[];
  open: boolean;
  onClose: () => void;
}

const NotificationDetailsDialog = ({
  details,
  open,
  onClose,
}: NotificationDetailsDialogProps) => {
  return (
    <Dialog fullWidth maxWidth="sm" onClose={onClose} open={open}>
      <DialogTitle>Error details</DialogTitle>
      <DialogContent dividers>
        {details.map((detail) => (
          <Typography component="p" key={detail.label} paragraph>
            <strong>{detail.label}:</strong> {detail.value}
          </Typography>
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default NotificationDetailsDialog;
