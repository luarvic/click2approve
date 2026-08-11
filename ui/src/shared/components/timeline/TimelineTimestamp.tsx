import { StackSpacing } from "@/shared/constants/constants";
import { getLocaleDateTimeString } from "@/shared/utils/dateTime";
import type { SxProps } from "@mui/material";
import { Stack, Tooltip, Typography } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import type { ReactNode } from "react";

interface TimelineTimestampProps {
  color?: string;
  date: Date;
  icon?: ReactNode;
  label?: string;
  sx?: SxProps<Theme>;
}

const TimelineTimestamp: React.FC<TimelineTimestampProps> = ({
  color = "text.secondary",
  date,
  icon,
  label,
  sx,
}) => (
  <Stack direction="row" spacing={StackSpacing.tight} alignItems="center">
    {icon &&
      (label ? (
        <Tooltip title={label}>
          <span>{icon}</span>
        </Tooltip>
      ) : icon)}
    <Typography color={color} sx={sx} variant="caption">
      {getLocaleDateTimeString(date)}
    </Typography>
  </Stack>
);

export default TimelineTimestamp;
