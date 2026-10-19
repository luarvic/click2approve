import { useSignatureCanvas } from "@/features/approvalRequests/hooks/useSignatureCanvas";
import { ControlTokens, StackSpacing } from "@/shared/theme/tokens";
import ClearIcon from "@mui/icons-material/Clear";
import { FormHelperText, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles";
import type { CSSProperties } from "react";

interface ApprovalRequestSignatureFieldProps {
  error?: boolean;
  helperText?: string;
  onChange: (value: string) => void;
  value?: string;
}

const signaturePadContainerSx =
  (error: boolean): SxProps<Theme> =>
  (theme) => ({
    border: "1px solid",
    borderColor: error ? theme.palette.error.main : theme.palette.divider,
    borderRadius: ControlTokens.borderRadius,
    overflow: "hidden",
    position: "relative",
    width: "100%",
    "&:focus-within": {
      borderColor: error ? theme.palette.error.main : theme.palette.primary.main,
      outline: `2px solid ${error ? theme.palette.error.main : theme.palette.primary.main}`,
      outlineOffset: -2,
    },
  });

const signatureCanvasStyle: CSSProperties = {
  display: "block",
  height: 180,
  touchAction: "none",
  width: "100%",
};

const signatureHintSx: SxProps<Theme> = {
  bottom: 12,
  color: "text.secondary",
  left: 16,
  pointerEvents: "none",
  position: "absolute",
};

const signatureActionsSx: SxProps<Theme> = {
  alignItems: "flex-start",
  width: "100%",
};

const clearSignatureButtonSx: SxProps<Theme> = {
  backgroundColor: "background.paper",
  position: "absolute",
  right: 8,
  top: 8,
  zIndex: 1,
  "&:hover": {
    backgroundColor: "action.hover",
  },
};

const ApprovalRequestSignatureField: React.FC<ApprovalRequestSignatureFieldProps> = ({
  error = false,
  helperText,
  onChange,
  value,
}) => {
  const theme = useTheme();
  const signatureBackgroundColor = theme.palette.background.paper;
  const signaturePenColor = theme.palette.text.primary;
  const { canvasRef, clear } = useSignatureCanvas({
    backgroundColor: signatureBackgroundColor,
    editable: true,
    onChange,
    penColor: signaturePenColor,
    value,
  });

  return (
    <Stack spacing={StackSpacing.default} sx={signatureActionsSx}>
      <Stack sx={signaturePadContainerSx(error)}>
        <Tooltip title="Clear signature">
          <IconButton aria-label="Clear signature" onClick={clear} size="small" sx={clearSignatureButtonSx}>
            <ClearIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <canvas ref={canvasRef} aria-label="Signature" style={signatureCanvasStyle} />
        {!value && (
          <Typography aria-hidden="true" variant="caption" sx={signatureHintSx}>
            Draw your signature
          </Typography>
        )}
      </Stack>
      {helperText && <FormHelperText error={error}>{helperText}</FormHelperText>}
    </Stack>
  );
};

export default ApprovalRequestSignatureField;
