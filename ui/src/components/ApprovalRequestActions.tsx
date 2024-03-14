import { ArrowDropDownCircle } from "@mui/icons-material";
import { IconButton, Menu, MenuItem } from "@mui/material";
import { useState } from "react";
import { IApprovalRequest } from "../models/ApprovalRequest";
import { Tab } from "../models/Tab";
import { approvalRequestStore } from "../stores/ApprovalRequestStore";
import { commonStore } from "../stores/CommonStore";

interface IApprovalRequestActionsProps {
  approvalRequest: IApprovalRequest;
}

export const ApprovalRequestActions: React.FC<IApprovalRequestActionsProps> = ({
  approvalRequest,
}) => {
  const { setApprovalRequestReviewDialogIsOpen, setCurrentApprovalRequest } =
    approvalRequestStore;
  const { currentTab } = commonStore;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleReview = () => {
    setCurrentApprovalRequest(approvalRequest);
    setApprovalRequestReviewDialogIsOpen(true);
    handleClose();
  };
  const handleDelete = () => {
    handleClose();
  };

  const actions = (tab: Tab) => {
    const result: JSX.Element[] = [
      <MenuItem onClick={handleReview}>Review</MenuItem>,
    ];
    if (tab === Tab.Sent) {
      result.push(<MenuItem onClick={handleDelete}>Delete</MenuItem>);
    }
    return <>{result}</>;
  };

  return (
    <div>
      <IconButton
        id="basic-button"
        aria-controls={open ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
      >
        <ArrowDropDownCircle />
      </IconButton>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        {actions(currentTab)}
      </Menu>
    </div>
  );
};
