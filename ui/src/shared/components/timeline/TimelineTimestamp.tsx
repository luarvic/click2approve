import { StackSpacing } from "@/shared/constants/constants";
import { getLocaleDateTimeString } from "@/shared/utils/dateTime";
import type { SxProps } from "@mui/material";
import { Box, Stack, Tooltip, Typography } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import type { ReactNode } from "react";

interface TimelineTimestampProps {
  color?: string;
  date?: Date;
  icon?: ReactNode;
  iconSize?: "inherit" | "small";
  label?: string;
  sx?: SxProps<Theme>;
  text?: string;
}

const smallIconSx: SxProps<Theme> = {
  alignItems: "center",
  display: "inline-flex",
  fontSize: "1.25rem",
  lineHeight: 1,
};

const TimelineTimestamp: React.FC<TimelineTimestampProps> = ({
  color = "text.secondary",
  date,
  icon,
  iconSize = "inherit",
  label,
  sx,
  text,
}) => (
  <Stack direction="row" spacing={StackSpacing.tight} alignItems="center">
    {icon &&
      (label ? (
        <Tooltip title={label}>
          <Box component="span" sx={iconSize === "small" ? smallIconSx : undefined}>
            {icon}
          </Box>
        </Tooltip>
      ) : (
        icon
      ))}
    <Typography color={color} sx={sx} variant="caption">
      {text ?? (date ? getLocaleDateTimeString(date) : "")}
    </Typography>
  </Stack>
);

export default TimelineTimestamp;
