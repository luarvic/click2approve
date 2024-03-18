import { ArrowDropDownCircle } from "@mui/icons-material";
import { IconButton, Menu, MenuItem } from "@mui/material";
import { useState } from "react";
import { IApprovalRequest } from "../../models/ApprovalRequest";
import { approvalRequestStore } from "../../stores/ApprovalRequestStore";
import { commonStore } from "../../stores/CommonStore";

interface IApprovalRequestActionsProps {
  approvalRequest: IApprovalRequest;
}

export const MenuApprovalRequestActions: React.FC<
  IApprovalRequestActionsProps
> = ({ approvalRequest }) => {
  const {
    setApprovalRequestViewDialogIsOpen,
    setApprovalRequestDeleteDialogIsOpen,
  } = commonStore;
  const { setCurrentApprovalRequest } = approvalRequestStore;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleView = () => {
    setCurrentApprovalRequest(approvalRequest);
    setApprovalRequestViewDialogIsOpen(true);
    handleClose();
  };
  const handleDelete = () => {
    setCurrentApprovalRequest(approvalRequest);
    setApprovalRequestDeleteDialogIsOpen(true);
    handleClose();
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
        <MenuItem onClick={handleView}>Track</MenuItem>
        <MenuItem onClick={handleDelete}>Delete</MenuItem>
      </Menu>
    </div>
  );
};
