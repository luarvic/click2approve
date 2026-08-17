import { StackSpacing } from "@/shared/constants/constants";
import type { SxProps } from "@mui/material";
import { Box, Stack } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import type { ReactNode } from "react";

interface ApprovalRequestParticipantPairProps {
  firstLabel: ReactNode;
  firstParticipant: ReactNode;
  firstTimestamp: ReactNode;
  secondLabel?: ReactNode;
  secondParticipant?: ReactNode;
  secondTimestamp?: ReactNode;
}

const pairSx: SxProps<Theme> = {
  alignItems: "stretch",
  display: "flex",
  flexDirection: { xs: "column", sm: "row" },
  gap: StackSpacing.default,
  pt: StackSpacing.default,
};

const participantColumnSx: SxProps<Theme> = {
  alignSelf: "stretch",
  borderRadius: 1,
  px: 1.5,
  pl: { xs: 0, sm: 1.5 },
};

const firstParticipantColumnSx: SxProps<Theme> = {
  ...participantColumnSx,
  pl: 0,
};

const ApprovalRequestParticipantPair: React.FC<ApprovalRequestParticipantPairProps> = ({
  firstLabel,
  firstParticipant,
  firstTimestamp,
  secondLabel,
  secondParticipant,
  secondTimestamp,
}) => {
  const hasSecondParticipant = Boolean(secondLabel || secondParticipant || secondTimestamp);

  return (
    <Box sx={pairSx}>
      <Stack spacing={StackSpacing.default} sx={firstParticipantColumnSx}>
        {firstLabel}
        {firstParticipant}
        {firstTimestamp}
      </Stack>
      {hasSecondParticipant && (
        <Stack spacing={StackSpacing.default} sx={participantColumnSx}>
          {secondLabel}
          {secondParticipant}
          {secondTimestamp}
        </Stack>
      )}
    </Box>
  );
};

export default ApprovalRequestParticipantPair;
