import { Forms } from "@/shared/components/dialogs/formStyles";
import { notification } from "@/shared/utils/notifications";
import { ContentCopy } from "@mui/icons-material";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
} from "@mui/material";
import { useCallback } from "react";

const tokenFieldSx = { "& .MuiOutlinedInput-root": { bgcolor: "action.hover" } };

interface ApiTokenCreatedDialogProps {
  open: boolean;
  value: string | null;
  onClose: () => void;
}

const ApiTokenCreatedDialog: React.FC<ApiTokenCreatedDialogProps> = ({ open, value, onClose }) => {
  const handleCopy = useCallback(
    async (showSuccessNotification: boolean) => {
      if (!value) return;
      try {
        await navigator.clipboard.writeText(value);
        if (showSuccessNotification) notification.success("API token copied.");
      } catch {
        notification.error("Unable to copy API token.");
      }
    },
    [value],
  );

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose}>
      <DialogTitle>Copy your API token</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={Forms.formStackSpacing}>
          <DialogContentText>
            For your security, this token will not be shown again after you close this dialog.
          </DialogContentText>
          <TextField
            aria-label="API token"
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title="Copy token">
                    <IconButton aria-label="Copy API token" edge="end" onClick={() => void handleCopy(true)}>
                      <ContentCopy />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ),
              readOnly: true,
            }}
            multiline
            sx={tokenFieldSx}
            value={value ?? ""}
            variant="outlined"
          />
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
