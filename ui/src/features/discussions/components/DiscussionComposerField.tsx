import { AttachFile } from "@mui/icons-material";
import { IconButton, InputAdornment, TextField } from "@mui/material";

interface DiscussionComposerFieldProps {
  attachmentsAreEnabled: boolean;
  body: string;
  error?: string;
  disabled?: boolean;
  uploading?: boolean;
  onAttachFiles: () => void;
  onBodyChange: (value: string) => void;
  onSend: () => Promise<void>;
}

const attachmentAdornmentSx = { alignSelf: "flex-end", mb: 0.5 } as const;
const DiscussionComposerField = ({
  attachmentsAreEnabled,
  body,
  error,
  disabled = false,
  uploading = false,
  onAttachFiles,
  onBodyChange,
  onSend,
}: DiscussionComposerFieldProps) => (
  <TextField
    fullWidth
    label="Message"
    error={Boolean(error)}
    helperText={error}
    multiline
    slotProps={{
      input: {
        endAdornment: attachmentsAreEnabled ? (
          <InputAdornment position="end" sx={attachmentAdornmentSx}>
            <IconButton
              aria-label="Attach files"
              color="primary"
              disabled={disabled}
              loading={uploading}
              onClick={onAttachFiles}
              size="small"
              title="Attach files"
            >
              <AttachFile fontSize="small" />
            </IconButton>
          </InputAdornment>
        ) : undefined,
      },
    }}
    disabled={disabled}
    value={body}
    onChange={(event) => onBodyChange(event.target.value)}
    onKeyDown={(event) => {
      const isMessageInput = event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLInputElement;
      if (isMessageInput && event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
        event.preventDefault();
        void onSend();
      }
    }}
  />
);
export default DiscussionComposerField;
