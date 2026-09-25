import { Flex } from "@/shared/components/layout/flexStyles";
import { Text } from "@/shared/components/text/textStyles";
import { normalizeEmailForDisplay, stripInlineEmail } from "@/shared/utils/displayNameHelpers";
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

const primaryNameSx = {
  fontWeight: 600,
} as const;

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
  const secondaryIsVisible = secondary && normalizeEmailForDisplay(primary) !== secondary;

  return (
    <Stack sx={[Flex.minWidthZeroSx, ...(Array.isArray(sx) ? sx : [sx])]}>
      <Typography
        noWrap={!allowDisplayNameWrap}
        variant="body2"
        sx={[primaryNameSx, !allowDisplayNameWrap && Text.overflowEllipsisSx]}
      >
        {primary}
      </Typography>
      {showEmailAddress && secondaryIsVisible && (
        <Typography noWrap variant="body2" color="text.secondary" sx={Text.overflowEllipsisSx}>
          {secondary}
        </Typography>
      )}
    </Stack>
  );
};

export default DisplayName;
