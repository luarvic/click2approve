import { ArrowDropDownCircle } from "@mui/icons-material";
import { IconButton, Menu, MenuItem } from "@mui/material";
import { useState } from "react";
import { IApprovalRequest } from "../../models/approvalRequest";
import { stores } from "../../stores/Stores";

interface IApprovalRequestActionsMenuProps {
  approvalRequest: IApprovalRequest;
}

export const ApprovalRequestActionsMenu: React.FC<
  IApprovalRequestActionsMenuProps
> = ({ approvalRequest }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleView = () => {
    stores.approvalRequestStore.setCurrentApprovalRequest(approvalRequest);
    stores.commonStore.setApprovalRequestViewDialogIsOpen(true);
    handleClose();
  };
  const handleDelete = () => {
    stores.approvalRequestStore.setCurrentApprovalRequest(approvalRequest);
    stores.commonStore.setApprovalRequestDeleteDialogIsOpen(true);
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
