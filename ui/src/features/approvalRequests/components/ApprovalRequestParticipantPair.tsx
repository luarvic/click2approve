import { StackSpacing } from "@/shared/constants/constants";
import { Box, Stack } from "@mui/material";
import type { SxProps } from "@mui/material";
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
};

const participantColumnSx: SxProps<Theme> = {
  alignSelf: "stretch",
  borderRadius: 1,
  px: 1.5,
  py: 1,
  pl: { xs: 0, sm: 1.5 },
  pb: 0,
};

const firstParticipantColumnSx: SxProps<Theme> = {
  ...participantColumnSx,
  pl: 0,
};

const timestampSx: SxProps<Theme> = {
  paddingTop: StackSpacing.default,
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
      <Stack justifyContent="space-between" sx={firstParticipantColumnSx}>
        <Stack spacing={StackSpacing.default}>
          {firstLabel}
          {firstParticipant}
        </Stack>
        <Box sx={timestampSx}>{firstTimestamp}</Box>
      </Stack>
      {hasSecondParticipant && (
        <Stack justifyContent="space-between" sx={participantColumnSx}>
          <Stack spacing={StackSpacing.default}>
            {secondLabel}
            {secondParticipant}
          </Stack>
          <Box sx={timestampSx}>{secondTimestamp}</Box>
        </Stack>
      )}
    </Box>
  );
};

export default ApprovalRequestParticipantPair;
