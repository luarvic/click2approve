import { notification } from "@/shared/utils/notifications";
import { ContentCopy } from "@mui/icons-material";
import { IconButton, InputAdornment, TextField, Tooltip } from "@mui/material";

const codeFieldSx = { "& .MuiOutlinedInput-root": { bgcolor: "action.hover" } };

interface Props {
  label: string;
  value: string;
}

/** Displays a read-only code or list of codes with a clipboard action. */
const CopyableCodeField = ({ label, value }: Props) => {
  const copy = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      notification.success(`${label} copied.`);
    } catch {
      notification.error("Unable to copy to clipboard.");
    }
  };

  return (
    <TextField
      fullWidth
      multiline
      sx={codeFieldSx}
      value={value}
      variant="outlined"
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <Tooltip title={`Copy ${label}`}>
                <IconButton
                  aria-label={`Copy ${label}`}
                  disabled={!value}
                  edge="end"
                  onClick={() => void copy()}
                  type="button"
                >
                  <ContentCopy />
                </IconButton>
              </Tooltip>
            </InputAdornment>
          ),
          readOnly: true,
        },

        htmlInput: { "aria-label": label },
      }}
    />
  );
};

export default CopyableCodeField;
