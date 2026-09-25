import { Text } from "@/shared/components/text/textStyles";
import { stripInlineEmail } from "@/shared/utils/displayNameHelpers";
import type { SxProps } from "@mui/material";
import { Box, Typography } from "@mui/material";
import type { Theme } from "@mui/material/styles";

interface OneLineDisplayNameProps {
  displayName?: string | null;
  fallback?: string;
  sx?: SxProps<Theme>;
  variant?: "body1" | "body2";
}

const rootSx: SxProps<Theme> = {
  alignItems: "center",
  display: "flex",
  height: "100%",
  minWidth: 0,
};

const OneLineDisplayName: React.FC<OneLineDisplayNameProps> = ({
  displayName,
  fallback = "Unknown user",
  sx,
  variant = "body1",
}) => (
  <Box sx={[rootSx, ...(Array.isArray(sx) ? sx : [sx])]}>
    <Typography noWrap sx={Text.overflowEllipsisSx} variant={variant}>
      {stripInlineEmail(displayName) || fallback}
    </Typography>
  </Box>
);

export default OneLineDisplayName;
