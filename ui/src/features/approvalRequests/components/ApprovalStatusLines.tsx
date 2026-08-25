import { ApprovalRequestStatus } from "@/features/approvalRequests/models/approvalRequestStatus";
import { ApprovalRequestTaskAction } from "@/features/approvalRequests/models/approvalRequestTaskAction";
import { ApprovalRequestTaskStatus } from "@/features/approvalRequests/models/approvalRequestTaskStatus";
import { getApprovalRequestTaskCompletedActionLabel } from "@/features/approvalRequests/utils/approvalRequestTaskActionLabels";
import {
  StatusLineColor,
  StatusLineColors,
  StatusLineLabel,
  StatusLineSection,
} from "@/shared/components/status/StatusLines";
import type { SxProps } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import type { ReactNode } from "react";

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

export const ApprovalRequestStatusColors = {
  [ApprovalRequestStatus.Canceled]: StatusLineColors.canceled,
  [ApprovalRequestStatus.Completed]: StatusLineColors.completedSuccessfully,
  [ApprovalRequestStatus.Draft]: StatusLineColors.other,
  [ApprovalRequestStatus.Pending]: StatusLineColors.pending,
  [ApprovalRequestStatus.Started]: StatusLineColors.started,
  [ApprovalRequestStatus.Superseded]: StatusLineColors.canceled,
} as const;

export const ApprovalRequestTaskStatusColors = {
  [ApprovalRequestTaskStatus.Canceled]: StatusLineColors.canceled,
  [ApprovalRequestTaskStatus.Completed]: StatusLineColors.completedSuccessfully,
  [ApprovalRequestTaskStatus.Pending]: StatusLineColors.pending,
  [ApprovalRequestTaskStatus.Skipped]: StatusLineColors.canceled,
} as const;

export const getApprovalRequestStatusColor = (status: ApprovalRequestStatus, result?: boolean) =>
  status === ApprovalRequestStatus.Completed && result === false
    ? StatusLineColors.completedUnsuccessfully
    : ApprovalRequestStatusColors[status];

export const getApprovalRequestTaskStatusColor = (status: ApprovalRequestTaskStatus, result?: boolean) =>
  status === ApprovalRequestTaskStatus.Completed && result === false
    ? StatusLineColors.completedUnsuccessfully
    : ApprovalRequestTaskStatusColors[status];

export const getApprovalRequestStatusLineColor = (status: ApprovalRequestStatus, result?: boolean): StatusLineColor => {
  switch (status) {
    case ApprovalRequestStatus.Completed:
      return result === false ? "completedUnsuccessfully" : "completedSuccessfully";
    case ApprovalRequestStatus.Canceled:
    case ApprovalRequestStatus.Superseded:
      return "canceled";
    case ApprovalRequestStatus.Pending:
      return "pending";
    case ApprovalRequestStatus.Started:
      return "started";
    default:
      return "other";
  }
};

export const getApprovalRequestTaskStatusLineColor = (
  status: ApprovalRequestTaskStatus,
  result?: boolean,
): StatusLineColor => {
  switch (status) {
    case ApprovalRequestTaskStatus.Completed:
      return result === false ? "completedUnsuccessfully" : "completedSuccessfully";
    case ApprovalRequestTaskStatus.Skipped:
    case ApprovalRequestTaskStatus.Canceled:
      return "canceled";
    case ApprovalRequestTaskStatus.Pending:
      return "pending";
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

export const getApprovalRequestStatusLabel = (status: ApprovalRequestStatus, result?: boolean) =>
  status === ApprovalRequestStatus.Completed ? getCompletedStatusLabel(result) : ApprovalRequestStatus[status];

export const getApprovalRequestTaskStatusLabel = (
  status: ApprovalRequestTaskStatus,
  action: ApprovalRequestTaskAction,
  result?: boolean,
) =>
  status === ApprovalRequestTaskStatus.Completed
    ? getApprovalRequestTaskCompletedActionLabel(action, result)
    : ApprovalRequestTaskStatus[status];

export const ApprovalRequestStatusLineSection: React.FC<ApprovalRequestStatusLineSectionProps> = ({
  children,
  result,
  status,
  sx,
}) => (
  <StatusLineSection
    color={getApprovalRequestStatusLineColor(status, result)}
    label={getApprovalRequestStatusLabel(status, result)}
    sx={sx}
  >
    {children}
  </StatusLineSection>
);

export const ApprovalRequestStatusLineLabel: React.FC<ApprovalRequestStatusLineLabelProps> = ({ result, status }) => (
  <StatusLineLabel
    color={getApprovalRequestStatusLineColor(status, result)}
    label={getApprovalRequestStatusLabel(status, result)}
  />
);

export const ApprovalRequestTaskStatusLineLabel: React.FC<ApprovalRequestTaskStatusLineLabelProps> = ({
  action,
  result,
  status,
}) => (
  <StatusLineLabel
    color={getApprovalRequestTaskStatusLineColor(status, result)}
    label={getApprovalRequestTaskStatusLabel(status, action, result)}
  />
);
