import { ArrowDropDownCircle } from "@mui/icons-material";
import { IconButton, Menu, MenuItem } from "@mui/material";
import { useState } from "react";
import { IApprovalRequestTask } from "../../models/approvalRequestTask";
import { commonStore } from "../../stores/commonStore";
import { taskStore } from "../../stores/taskStore";

interface ITaskActionsMenuProps {
  task: IApprovalRequestTask;
}

export const TaskActionsMenu: React.FC<ITaskActionsMenuProps> = ({ task }) => {
  const { setTaskReviewDialogIsOpen } = commonStore;
  const { setCurrentTask } = taskStore;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleReview = () => {
    setCurrentTask(task);
    setTaskReviewDialogIsOpen(true);
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
        <MenuItem onClick={handleReview}>Review</MenuItem>
      </Menu>
    </div>
  );
};