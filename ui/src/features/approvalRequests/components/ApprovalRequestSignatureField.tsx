import ClearIcon from "@mui/icons-material/Clear";
import { FormHelperText, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";
import SignaturePad from "signature_pad";
import type { PointGroup } from "signature_pad";

interface ApprovalRequestSignatureFieldProps {
  error?: boolean;
  helperText?: string;
  onChange: (value: string) => void;
}

const signaturePadContainerSx = (error: boolean): SxProps<Theme> => (theme) => ({
  border: "1px solid",
  borderColor: error
    ? theme.palette.error.main
    : theme.palette.mode === "dark"
      ? "rgba(255, 255, 255, 0.23)"
      : "rgba(0, 0, 0, 0.23)",
  borderRadius: 1,
  overflow: "hidden",
  position: "relative",
  width: "100%",
  "&:focus-within": {
    borderColor: error ? theme.palette.error.main : theme.palette.primary.main,
    borderWidth: 2,
  },
});

const signatureCanvasStyle: CSSProperties = {
  display: "block",
  height: 180,
  touchAction: "none",
  width: "100%",
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

const signatureTitleSx: SxProps<Theme> = {
  backgroundColor: "background.paper",
  left: 8,
  px: 0.25,
  position: "absolute",
  top: 8,
  zIndex: 1,
};

const applySignaturePenColor = (signatureData: PointGroup[], penColor: string): PointGroup[] =>
  signatureData.map((group) => ({ ...group, penColor }));

const stripSignaturePenColor = (signatureData: PointGroup[]): Omit<PointGroup, "penColor">[] =>
  signatureData.map((group) => {
    const { penColor, ...groupWithoutPenColor } = group;
    void penColor;
    return groupWithoutPenColor;
  });

const serializeSignature = (signatureData: PointGroup[]): string =>
  signatureData.length === 0 ? "" : JSON.stringify(stripSignaturePenColor(signatureData));

const ApprovalRequestSignatureField: React.FC<ApprovalRequestSignatureFieldProps> = ({
  error = false,
  helperText,
  onChange,
}) => {
  const theme = useTheme();
  const signatureBackgroundColor = theme.palette.background.paper;
  const signaturePenColor = theme.palette.text.primary;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signaturePadRef = useRef<SignaturePad | null>(null);
  const signatureDataRef = useRef<PointGroup[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }

    const signaturePad = new SignaturePad(canvas, {
      backgroundColor: signatureBackgroundColor,
      penColor: signaturePenColor,
    });
    signaturePadRef.current = signaturePad;

    const resizeCanvas = () => {
      const currentData = signaturePad.toData();
      const signatureData = currentData.length > 0 ? currentData : signatureDataRef.current;
      signatureDataRef.current = signatureData;
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * ratio;
      canvas.height = rect.height * ratio;
      canvas.getContext("2d")?.scale(ratio, ratio);
      signaturePad.clear();
      if (signatureData.length > 0) {
        signaturePad.fromData(applySignaturePenColor(signatureData, signaturePenColor));
      }
    };

    const handleEndStroke = () => {
      signatureDataRef.current = signaturePad.toData();
      onChange(serializeSignature(signatureDataRef.current));
    };
    const observer = new ResizeObserver(resizeCanvas);
    observer.observe(canvas);
    signaturePad.addEventListener("endStroke", handleEndStroke);
    resizeCanvas();

    return () => {
      signatureDataRef.current = signaturePad.toData();
      observer.disconnect();
      signaturePad.removeEventListener("endStroke", handleEndStroke);
      signaturePad.off();
      signaturePadRef.current = null;
    };
  }, [onChange, signatureBackgroundColor, signaturePenColor]);

  const handleClear = () => {
    signaturePadRef.current?.clear();
    signatureDataRef.current = [];
    onChange("");
  };

  return (
    <Stack spacing={1} sx={signatureActionsSx}>
      <Stack sx={signaturePadContainerSx(error)}>
        <Typography color="text.secondary" sx={signatureTitleSx} variant="caption">
          Signature
        </Typography>
        <Tooltip title="Clear signature">
          <IconButton
            aria-label="Clear signature"
            onClick={handleClear}
            size="small"
            sx={clearSignatureButtonSx}
          >
            <ClearIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <canvas ref={canvasRef} aria-label="Signature" style={signatureCanvasStyle} />
      </Stack>
      {helperText && <FormHelperText error={error}>{helperText}</FormHelperText>}
    </Stack>
  );
};

export default ApprovalRequestSignatureField;
