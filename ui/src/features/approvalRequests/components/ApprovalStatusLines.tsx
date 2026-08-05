import { ApprovalRequestStatus } from "@/features/approvalRequests/models/approvalRequestStatus";
import { ApprovalRequestTaskAction } from "@/features/approvalRequests/models/approvalRequestTaskAction";
import { ApprovalRequestTaskStatus } from "@/features/approvalRequests/models/approvalRequestTaskStatus";
import { getApprovalRequestTaskCompletedActionLabel } from "@/features/approvalRequests/utils/approvalRequestTaskActionLabels";
import { StackSpacing } from "@/shared/constants/constants";
import type { SxProps } from "@mui/material";
import { Box, Stack, Typography } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import type { ReactNode } from "react";

interface ApprovalStatusLineSectionProps {
  children: ReactNode;
  color: ApprovalStatusLineColor;
  label: string;
  lineVariant?: "solid" | "dotted";
  sx?: SxProps<Theme>;
}

interface ApprovalStatusLineLabelProps {
  color: ApprovalStatusLineColor;
  label: string;
}

interface ApprovalRequestStatusLineSectionProps {
  children: ReactNode;
  result?: boolean;
  status: ApprovalRequestStatus;
  sx?: SxProps<Theme>;
}

interface ApprovalRequestStatusLineLabelProps {
  result?: boolean;
  status: ApprovalRequestStatus;
}

interface ApprovalRequestTaskStatusLineLabelProps {
  action: ApprovalRequestTaskAction;
  result?: boolean;
  status: ApprovalRequestTaskStatus;
}

const statusLineWidth = "3px";
const statusLineOffset = 1.5;

export const ApprovalStatusLineColors = {
  canceled: "warning.main",
  completedSuccessfully: "success.main",
  completedUnsuccessfully: "error.main",
  other: "divider",
  started: "success.main",
} as const;

export type ApprovalStatusLineColor = keyof typeof ApprovalStatusLineColors;

const approvalStatusLineSectionSx = (
  color: ApprovalStatusLineColor,
  lineVariant?: "solid" | "dotted",
): SxProps<Theme> => ({
  borderLeft: `${statusLineWidth} ${lineVariant ?? (color === "started" ? "dotted" : "solid")}`,
  borderLeftColor: ApprovalStatusLineColors[color],
  minWidth: 0,
  pl: statusLineOffset,
});

const approvalStatusLineLabelSx = (
  color: ApprovalStatusLineColor,
): SxProps<Theme> => ({
  borderLeft: `${statusLineWidth} ${color === "started" ? "dotted" : "solid"}`,
  borderLeftColor: ApprovalStatusLineColors[color],
  height: "100%",
  justifyContent: "center",
  minWidth: 0,
  pl: statusLineOffset,
});

const approvalStatusBorderSx = (
  color: ApprovalStatusLineColor,
): SxProps<Theme> => ({
  borderLeft: `${statusLineWidth} ${color === "started" ? "dotted" : "solid"}`,
  borderLeftColor: color === "other"
    ? "text.disabled"
    : ApprovalStatusLineColors[color],
});

const getApprovalStatusLineSectionSx = (
  color: ApprovalStatusLineColor,
  lineVariant?: "solid" | "dotted",
  sx?: SxProps<Theme>,
): SxProps<Theme> => sx
  ? ([approvalStatusLineSectionSx(color, lineVariant), sx] as SxProps<Theme>)
  : approvalStatusLineSectionSx(color, lineVariant);

export const getApprovalStatusBorderSx = (
  color: ApprovalStatusLineColor,
  sx?: SxProps<Theme>,
): SxProps<Theme> => sx
  ? ([sx, approvalStatusBorderSx(color)] as SxProps<Theme>)
  : approvalStatusBorderSx(color);

export const getApprovalRequestStatusLineColor = (
  status: ApprovalRequestStatus,
  result?: boolean,
): ApprovalStatusLineColor => {
  switch (status) {
    case ApprovalRequestStatus.Completed:
      return result === false ? "completedUnsuccessfully" : "completedSuccessfully";
    case ApprovalRequestStatus.Canceled:
    case ApprovalRequestStatus.Superseded:
      return "canceled";
    case ApprovalRequestStatus.Started:
      return "started";
    default:
      return "other";
  }
};

export const getApprovalRequestTaskStatusLineColor = (
  status: ApprovalRequestTaskStatus,
  result?: boolean,
): ApprovalStatusLineColor => {
  switch (status) {
    case ApprovalRequestTaskStatus.Completed:
      return result === false ? "completedUnsuccessfully" : "completedSuccessfully";
    case ApprovalRequestTaskStatus.Skipped:
    case ApprovalRequestTaskStatus.Canceled:
      return "canceled";
    default:
      return "other";
  }
};

const getCompletedStatusLabel = (result?: boolean) => {
  if (result === true) {
    return "Completed successfully";
  }

  if (result === false) {
    return "Completed unsuccessfully";
  }

  return "Completed";
};

export const getApprovalRequestStatusLabel = (
  status: ApprovalRequestStatus,
  result?: boolean,
) => status === ApprovalRequestStatus.Completed
  ? getCompletedStatusLabel(result)
  : ApprovalRequestStatus[status];

export const getApprovalRequestTaskStatusLabel = (
  status: ApprovalRequestTaskStatus,
  action: ApprovalRequestTaskAction,
  result?: boolean,
) => status === ApprovalRequestTaskStatus.Completed
  ? getApprovalRequestTaskCompletedActionLabel(action, result)
  : ApprovalRequestTaskStatus[status];

export const ApprovalStatusLineSection: React.FC<ApprovalStatusLineSectionProps> = ({
  children,
  color,
  label,
  lineVariant,
  sx,
}) => (
  <Box
    aria-label={label}
    sx={getApprovalStatusLineSectionSx(color, lineVariant, sx)}
  >
    {children}
  </Box>
);

export const ApprovalStatusLineLabel: React.FC<ApprovalStatusLineLabelProps> = ({
  color,
  label,
}) => (
  <Stack
    spacing={StackSpacing.tight}
    sx={approvalStatusLineLabelSx(color)}
  >
    <Typography variant="body2">
      {label}
    </Typography>
  </Stack>
);

export const ApprovalRequestStatusLineSection: React.FC<ApprovalRequestStatusLineSectionProps> = ({
  children,
  result,
  status,
  sx,
}) => (
  <ApprovalStatusLineSection
    color={getApprovalRequestStatusLineColor(status, result)}
    label={getApprovalRequestStatusLabel(status, result)}
    sx={sx}
  >
    {children}
  </ApprovalStatusLineSection>
);

export const ApprovalRequestStatusLineLabel: React.FC<ApprovalRequestStatusLineLabelProps> = ({
  result,
  status,
}) => (
  <ApprovalStatusLineLabel
    color={getApprovalRequestStatusLineColor(status, result)}
    label={getApprovalRequestStatusLabel(status, result)}
  />
);

export const ApprovalRequestTaskStatusLineLabel: React.FC<ApprovalRequestTaskStatusLineLabelProps> = ({
  action,
  result,
  status,
}) => (
  <ApprovalStatusLineLabel
    color={getApprovalRequestTaskStatusLineColor(status, result)}
    label={getApprovalRequestTaskStatusLabel(status, action, result)}
  />
);
