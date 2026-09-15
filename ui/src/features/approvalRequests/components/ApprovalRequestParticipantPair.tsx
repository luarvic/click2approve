import ApprovalRequestField from "@/features/approvalRequests/components/ApprovalRequestField";
import { StackSpacing } from "@/shared/theme/tokens";
import type { SxProps } from "@mui/material";
import { Box, Stack } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import type { ReactNode } from "react";

interface ApprovalRequestParticipantPairProps {
  firstLabel?: string;
  firstParticipant: ReactNode;
  firstTimestamp: ReactNode;
  secondLabel?: string;
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
  const firstValue = (
    <Stack spacing={StackSpacing.default}>
      {firstParticipant}
      {firstTimestamp}
    </Stack>
  );
  const secondValue = (
    <Stack spacing={StackSpacing.default}>
      {secondParticipant}
      {secondTimestamp}
    </Stack>
  );

  return (
    <Box sx={pairSx}>
      <Stack sx={firstParticipantColumnSx}>
        {firstLabel ? <ApprovalRequestField label={firstLabel} value={firstValue} /> : firstValue}
      </Stack>
      {hasSecondParticipant && (
        <Stack sx={participantColumnSx}>
          {secondLabel ? <ApprovalRequestField label={secondLabel} value={secondValue} /> : secondValue}
        </Stack>
      )}
    </Box>
  );
};

export default ApprovalRequestParticipantPair;
