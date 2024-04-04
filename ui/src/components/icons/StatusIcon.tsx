import { Check, Close, Loop, QuestionMark } from "@mui/icons-material";
import { Tooltip } from "@mui/material";
import React from "react";
import { ApprovalStatus } from "../../models/approvalStatus";

interface IStatusIconProps {
  status: ApprovalStatus;
}

const StatusIcon: React.FC<IStatusIconProps> = ({ status }) => {
  const renderStatus = () => {
    switch (status) {
      case 0:
        return <Loop sx={{ verticalAlign: "middle" }} color="disabled" />;
      case 1:
        return <Check sx={{ verticalAlign: "middle" }} color="success" />;
      case 2:
        return <Close sx={{ verticalAlign: "middle" }} color="error" />;
      default:
        return (
          <QuestionMark sx={{ verticalAlign: "middle" }} color="disabled" />
        );
    }
  };

  return <Tooltip title={ApprovalStatus[status]}>{renderStatus()}</Tooltip>;
};

export default StatusIcon;
