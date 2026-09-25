import {
  getApprovalRequestStatusColor,
  getApprovalRequestStatusLabel,
} from "@/features/approvalRequests/components/ApprovalStatusLines";
import { ApprovalRequestStatus } from "@/features/approvalRequests/models/approvalRequestStatus";
import { Icons } from "@/shared/components/icons/iconStyles";
import { Check, Close, Loop, QuestionMark, Replay } from "@mui/icons-material";
import { Tooltip } from "@mui/material";
import React from "react";

interface StatusIconProps {
  result?: boolean;
  status: ApprovalRequestStatus;
}

const StatusIcon: React.FC<StatusIconProps> = ({ result, status }) => {
  const statusColor = getApprovalRequestStatusColor(status, result);

  const statusIconSx = { ...Icons.verticalAlignSx, color: statusColor };

  const renderStatus = () => {
    switch (status) {
      case ApprovalRequestStatus.Pending:
      case ApprovalRequestStatus.Started:
        return <Loop sx={statusIconSx} />;
      case ApprovalRequestStatus.Completed:
        return result === false ? <Close sx={statusIconSx} /> : <Check sx={statusIconSx} />;
      case ApprovalRequestStatus.Canceled:
        return <Close sx={statusIconSx} />;
      case ApprovalRequestStatus.Superseded:
        return <Replay sx={statusIconSx} />;
      default:
        return <QuestionMark sx={statusIconSx} />;
    }
  };

  return <Tooltip title={getApprovalRequestStatusLabel(status)}>{renderStatus()}</Tooltip>;
};

export default StatusIcon;
