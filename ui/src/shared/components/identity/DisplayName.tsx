import {
  normalizeEmailForDisplay,
  stripInlineEmail,
} from "@/shared/utils/displayNameHelpers";
import type { SxProps } from "@mui/material";
import { Stack, Typography } from "@mui/material";
import type { Theme } from "@mui/material/styles";

interface DisplayNameProps {
  allowDisplayNameWrap?: boolean;
  displayName?: string | null;
  email?: string | null;
  fallback?: string;
  showEmailAddress?: boolean;
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
  allowDisplayNameWrap = false,
  displayName,
  email,
  fallback = "Unknown user",
  showEmailAddress = true,
  sx,
}) => {
  const primary = stripInlineEmail(displayName) || fallback;
  const secondary = normalizeEmailForDisplay(email ?? undefined);
  const secondaryIsVisible =
    secondary && normalizeEmailForDisplay(primary) !== secondary;

  return (
    <Stack sx={[rootSx, ...(Array.isArray(sx) ? sx : [sx])]}>
      <Typography
        fontWeight={600}
        noWrap={!allowDisplayNameWrap}
        sx={allowDisplayNameWrap ? undefined : textSx}
        variant="body2"
      >
        {primary}
      </Typography>
      {showEmailAddress && secondaryIsVisible && (
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
