import { Box } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import type { PointGroup } from "signature_pad";

interface ReceiptSignatureProps {
  signatureJson: string;
}

const signatureInset = 12;
const signatureStrokeWidth = 2;

const signatureSx: SxProps<Theme> = {
  color: "text.primary",
  display: "block",
  height: 80,
  maxWidth: "100%",
  width: "100%",
};

const parseSignature = (signatureJson: string): PointGroup[] => {
  try {
    const signatureData: unknown = JSON.parse(signatureJson);
    return Array.isArray(signatureData) ? (signatureData as PointGroup[]) : [];
  } catch {
    return [];
  }
};

const ReceiptSignature: React.FC<ReceiptSignatureProps> = ({ signatureJson }) => {
  const signatureData = parseSignature(signatureJson);
  const points = signatureData.flatMap((group) => group.points ?? []);
  if (points.length === 0) {
    return null;
  }

  const minX = Math.min(...points.map((point) => point.x));
  const maxX = Math.max(...points.map((point) => point.x));
  const minY = Math.min(...points.map((point) => point.y));
  const maxY = Math.max(...points.map((point) => point.y));
  const width = maxX - minX + signatureInset * 2;
  const height = maxY - minY + signatureInset * 2;
  if (![minX, maxX, minY, maxY, width, height].every(Number.isFinite)) {
    return null;
  }

  return (
    <Box
      aria-label="Electronic signature"
      component="svg"
      preserveAspectRatio="xMinYMid meet"
      role="img"
      sx={signatureSx}
      viewBox={`0 0 ${width} ${height}`}
    >
      {signatureData.map((group, index) => (
        <polyline
          key={index}
          fill="none"
          points={(group.points ?? [])
            .map((point) => `${point.x - minX + signatureInset},${point.y - minY + signatureInset}`)
            .join(" ")}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={signatureStrokeWidth}
        />
      ))}
    </Box>
  );
};

export default ReceiptSignature;
