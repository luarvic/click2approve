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
      case 0:
        return <Loop sx={Icons.verticalAlignSx} color="disabled" />;
      case 1:
        return <Check sx={Icons.verticalAlignSx} color="success" />;
      case 2:
        return <Close sx={Icons.verticalAlignSx} color="error" />;
      default:
        return <QuestionMark sx={Icons.verticalAlignSx} color="disabled" />;
    }
  };

  return (
    <Tooltip title={ApprovalRequestStatus[status]}>{renderStatus()}</Tooltip>
  );
};

export default StatusIcon;
