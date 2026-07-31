import { stripInlineEmail } from "@/shared/utils/displayNameHelpers";
import type { SxProps } from "@mui/material";
import { Box, Typography } from "@mui/material";
import type { Theme } from "@mui/material/styles";

interface OneLineDisplayNameProps {
  displayName?: string | null;
  fallback?: string;
  sx?: SxProps<Theme>;
}

const rootSx: SxProps<Theme> = {
  alignItems: "center",
  display: "flex",
  height: "100%",
  minWidth: 0,
};

const textSx: SxProps<Theme> = {
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const OneLineDisplayName: React.FC<OneLineDisplayNameProps> = ({
  displayName,
  fallback = "Unknown user",
  sx,
}) => (
  <Box
    sx={[
      rootSx,
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    <Typography noWrap sx={textSx} variant="body1">
      {stripInlineEmail(displayName) || fallback}
    </Typography>
  </Box>
);

export default OneLineDisplayName;
