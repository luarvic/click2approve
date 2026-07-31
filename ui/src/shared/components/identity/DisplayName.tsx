import {
  normalizeEmailForDisplay,
  stripInlineEmail,
} from "@/shared/utils/displayNameHelpers";
import type { SxProps } from "@mui/material";
import { Stack, Typography } from "@mui/material";
import type { Theme } from "@mui/material/styles";

interface DisplayNameProps {
  displayName?: string | null;
  email?: string | null;
  fallback?: string;
  sx?: SxProps<Theme>;
}

const rootSx: SxProps<Theme> = {
  minWidth: 0,
};

const textSx: SxProps<Theme> = {
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const DisplayName: React.FC<DisplayNameProps> = ({
  displayName,
  email,
  fallback = "Unknown user",
  sx,
}) => {
  const primary = stripInlineEmail(displayName) || fallback;
  const secondary = normalizeEmailForDisplay(email ?? undefined);
  const secondaryIsVisible =
    secondary && normalizeEmailForDisplay(primary) !== secondary;

  return (
    <Stack sx={[rootSx, ...(Array.isArray(sx) ? sx : [sx])]}>
      <Typography noWrap sx={textSx} variant="body1">
        {primary}
      </Typography>
      {secondaryIsVisible && (
        <Typography
          color="text.secondary"
          noWrap
          sx={textSx}
          variant="body2"
        >
          {secondary}
        </Typography>
      )}
    </Stack>
  );
};

export default DisplayName;
