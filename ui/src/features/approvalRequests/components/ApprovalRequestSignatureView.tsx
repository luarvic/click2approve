import { normalizeSignatureLeft } from "@/features/approvalRequests/components/approvalRequestSignatureUtils";
import { Box, FormHelperText, Stack } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";
import SignaturePad from "signature_pad";
import type { PointGroup } from "signature_pad";

interface ApprovalRequestSignatureViewProps {
  signatureJson?: string;
}

const signaturePadContainerSx: SxProps<Theme> = {
  backgroundColor: "transparent",
  borderRadius: 1,
  height: 180,
  overflow: "hidden",
  position: "relative",
  width: "100%",
};

const signatureCanvasStyle: CSSProperties = {
  display: "block",
  height: "100%",
  width: "100%",
};

const parseSignature = (signatureJson?: string): PointGroup[] => {
  if (!signatureJson) {
    return [];
  }

  try {
    const parsed = JSON.parse(signatureJson);
    return Array.isArray(parsed) ? (parsed as PointGroup[]) : [];
  } catch {
    return [];
  }
};

const applySignaturePenColor = (signatureData: PointGroup[], penColor: string): PointGroup[] =>
  signatureData.map((group) => ({ ...group, penColor }));

const ApprovalRequestSignatureView: React.FC<ApprovalRequestSignatureViewProps> = ({ signatureJson }) => {
  const theme = useTheme();
  const signaturePenColor = theme.palette.text.primary;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !signatureJson) {
      return undefined;
    }

    const signaturePad = new SignaturePad(canvas, {
      backgroundColor: "rgba(255, 255, 255, 0)",
      penColor: signaturePenColor,
    });
    signaturePad.off();

    const resizeCanvas = () => {
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * ratio;
      canvas.height = rect.height * ratio;
      canvas.getContext("2d")?.scale(ratio, ratio);
      signaturePad.clear();
      const signatureData = applySignaturePenColor(
        normalizeSignatureLeft(parseSignature(signatureJson)),
        signaturePenColor,
      );
      if (signatureData.length > 0) {
        signaturePad.fromData(signatureData);
      }
    };

    const observer = new ResizeObserver(resizeCanvas);
    observer.observe(canvas);
    resizeCanvas();

    return () => {
      observer.disconnect();
      signaturePad.off();
    };
  }, [signatureJson, signaturePenColor]);

  return (
    <Stack spacing={1}>
      <Box sx={signaturePadContainerSx}>
        <canvas ref={canvasRef} aria-label="Signature" style={signatureCanvasStyle} />
      </Box>
      {!signatureJson && <FormHelperText>Signature was not captured.</FormHelperText>}
    </Stack>
  );
};

export default ApprovalRequestSignatureView;
