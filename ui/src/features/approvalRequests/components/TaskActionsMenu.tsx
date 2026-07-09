import { stores } from "@/app/stores";
import { ApprovalRequestTask } from "@/features/approvalRequests/models/approvalRequestTask";
import { Menus } from "@/shared/constants/constants";
import { MoreHoriz } from "@mui/icons-material";
import { Box, IconButton, Menu, MenuItem } from "@mui/material";
import { useState } from "react";

interface TaskActionsMenuProps {
  task: ApprovalRequestTask;
}

const TaskActionsMenu: React.FC<TaskActionsMenuProps> = ({ task }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleReview = () => {
    stores.approvalRequestTaskStore.setCurrent(task);
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
        <MoreHoriz />
      </IconButton>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
        anchorOrigin={Menus.anchorOrigin}
        transformOrigin={Menus.transformOrigin}
      >
        <MenuItem onClick={handleReview}>
          {task.completedAt ? "View" : "Review"}
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default TaskActionsMenu;
