import { Check, Close, Loop, QuestionMark } from "@mui/icons-material";
import { Tooltip } from "@mui/material";
import React from "react";
import { ICON_VERTICAL_ALIGN_SX } from "../../data/constants";
import { ApprovalStatus } from "../../models/approvalStatus";

interface IStatusIconProps {
  status: ApprovalStatus;
}

const StatusIcon: React.FC<IStatusIconProps> = ({ status }) => {
  const renderStatus = () => {
    switch (status) {
      case 0:
        return <Loop sx={ICON_VERTICAL_ALIGN_SX} color="disabled" />;
      case 1:
        return <Check sx={ICON_VERTICAL_ALIGN_SX} color="success" />;
      case 2:
        return <Close sx={ICON_VERTICAL_ALIGN_SX} color="error" />;
      default:
        return (
          <QuestionMark sx={ICON_VERTICAL_ALIGN_SX} color="disabled" />
        );
    }
  };

  return <Tooltip title={ApprovalStatus[status]}>{renderStatus()}</Tooltip>;
};

export default StatusIcon;
