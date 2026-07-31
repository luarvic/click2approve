import { ApprovalRequestStatus } from "@/features/approvalRequests/models/approvalRequestStatus";
import { ApprovalRequestTaskStatus } from "@/features/approvalRequests/models/approvalRequestTaskStatus";
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
  status: ApprovalRequestStatus;
  sx?: SxProps<Theme>;
}

interface ApprovalRequestStatusLineLabelProps {
  status: ApprovalRequestStatus;
}

interface ApprovalRequestTaskStatusLineLabelProps {
  status: ApprovalRequestTaskStatus;
}

const statusLineWidth = "3px";
const statusLineOffset = 1.5;

export const ApprovalStatusLineColors = {
  approved: "success.main",
  canceled: "warning.main",
  changeRequested: "error.main",
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
  borderLeft: `${statusLineWidth} solid`,
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
): ApprovalStatusLineColor => {
  switch (status) {
    case ApprovalRequestStatus.Approved:
      return "approved";
    case ApprovalRequestStatus.Canceled:
    case ApprovalRequestStatus.Superseded:
      return "canceled";
    case ApprovalRequestStatus.Rejected:
      return "changeRequested";
    case ApprovalRequestStatus.Started:
      return "started";
    default:
      return "other";
  }
};

export const getApprovalRequestTaskStatusLineColor = (
  status: ApprovalRequestTaskStatus,
): ApprovalStatusLineColor => {
  switch (status) {
    case ApprovalRequestTaskStatus.Approved:
      return "approved";
    case ApprovalRequestTaskStatus.Skipped:
    case ApprovalRequestTaskStatus.Canceled:
      return "canceled";
    case ApprovalRequestTaskStatus.Rejected:
      return "changeRequested";
    default:
      return "other";
  }
};

export const getApprovalRequestStatusLabel = (
  status: ApprovalRequestStatus,
) => ApprovalRequestStatus[status];

export const getApprovalRequestTaskStatusLabel = (
  status: ApprovalRequestTaskStatus,
) => ApprovalRequestTaskStatus[status];

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
  status,
  sx,
}) => (
  <ApprovalStatusLineSection
    color={getApprovalRequestStatusLineColor(status)}
    label={getApprovalRequestStatusLabel(status)}
    sx={sx}
  >
    {children}
  </ApprovalStatusLineSection>
);

export const ApprovalRequestStatusLineLabel: React.FC<ApprovalRequestStatusLineLabelProps> = ({
  status,
}) => (
  <ApprovalStatusLineLabel
    color={getApprovalRequestStatusLineColor(status)}
    label={getApprovalRequestStatusLabel(status)}
  />
);

export const ApprovalRequestTaskStatusLineLabel: React.FC<ApprovalRequestTaskStatusLineLabelProps> = ({
  status,
}) => (
  <ApprovalStatusLineLabel
    color={getApprovalRequestTaskStatusLineColor(status)}
    label={getApprovalRequestTaskStatusLabel(status)}
  />
);
