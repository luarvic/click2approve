import {
  getApprovalRequestStatusLabel,
} from "@/features/approvalRequests/components/ApprovalStatusLines";
import { ApprovalRequestStatus } from "@/features/approvalRequests/models/approvalRequestStatus";
import { Icons } from "@/shared/constants/constants";
import { Check, Close, Loop, QuestionMark } from "@mui/icons-material";
import { Tooltip } from "@mui/material";
import React from "react";

interface StatusIconProps {
  status: ApprovalRequestStatus;
}

const StatusIcon: React.FC<StatusIconProps> = ({ status }) => {
  const renderStatus = () => {
    switch (status) {
      case ApprovalRequestStatus.Pending:
      case ApprovalRequestStatus.Started:
        return <Loop sx={Icons.verticalAlignSx} color="disabled" />;
      case ApprovalRequestStatus.Approved:
        return <Check sx={Icons.verticalAlignSx} color="success" />;
      case ApprovalRequestStatus.Rejected:
      case ApprovalRequestStatus.Canceled:
        return <Close sx={Icons.verticalAlignSx} color="error" />;
      default:
        return <QuestionMark sx={Icons.verticalAlignSx} color="disabled" />;
    }
  };

  return (
    <Tooltip title={getApprovalRequestStatusLabel(status)}>{renderStatus()}</Tooltip>
  );
};

export default StatusIcon;
