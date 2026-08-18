import { useSignatureCanvas } from "@/features/approvalRequests/hooks/useSignatureCanvas";
import { StackSpacing } from "@/shared/constants/constants";
import { Box, FormHelperText, Stack } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import type { CSSProperties } from "react";

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

const ApprovalRequestSignatureView: React.FC<ApprovalRequestSignatureViewProps> = ({ signatureJson }) => {
  const theme = useTheme();
  const signaturePenColor = theme.palette.text.primary;
  const { canvasRef } = useSignatureCanvas({
    backgroundColor: "rgba(255, 255, 255, 0)",
    penColor: signaturePenColor,
    value: signatureJson,
  });

  return (
    <Stack spacing={StackSpacing.default}>
      <Box sx={signaturePadContainerSx}>
        <canvas ref={canvasRef} aria-label="Signature" style={signatureCanvasStyle} />
      </Box>
      {!signatureJson && <FormHelperText>Signature was not captured.</FormHelperText>}
    </Stack>
  );
};

export default ApprovalRequestSignatureView;
