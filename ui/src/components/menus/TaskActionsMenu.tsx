import { ArrowDropDownCircle } from "@mui/icons-material";
import { Box, IconButton, Menu, MenuItem } from "@mui/material";
import { useState } from "react";
import { IApprovalRequestTask } from "../../models/approvalRequestTask";
import {
  MENU_ANCHOR_ORIGIN,
  MENU_SLOT_PROPS,
  MENU_TRANSFORM_ORIGIN,
} from "../../stores/constantsStore";
import { stores } from "../../stores/stores";

interface ITaskActionsMenuProps {
  task: IApprovalRequestTask;
}

const TaskActionsMenu: React.FC<ITaskActionsMenuProps> = ({ task }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleReview = () => {
    stores.taskStore.setCurrentTask(task);
    stores.commonStore.setTaskReviewDialogIsOpen(true);
    handleClose();
  };

  return (
    <Box>
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
        anchorOrigin={MENU_ANCHOR_ORIGIN}
        transformOrigin={MENU_TRANSFORM_ORIGIN}
        slotProps={MENU_SLOT_PROPS}
      >
        <MenuItem onClick={handleReview}>Review</MenuItem>
      </Menu>
    </Box>
  );
};

export default TaskActionsMenu;
