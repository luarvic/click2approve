import { MoreHoriz } from "@mui/icons-material";
import { Box, IconButton, Menu, MenuItem } from "@mui/material";
import { useState } from "react";
import {
  MENU_ANCHOR_ORIGIN,
  MENU_SLOT_PROPS,
  MENU_TRANSFORM_ORIGIN,
} from "../../data/constants";
import { IApprovalRequest } from "../../models/approvalRequest";
import { stores } from "../../stores/stores";

interface IApprovalRequestActionsMenuProps {
  approvalRequest: IApprovalRequest;
}

const ApprovalRequestActionsMenu: React.FC<
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
        anchorOrigin={MENU_ANCHOR_ORIGIN}
        transformOrigin={MENU_TRANSFORM_ORIGIN}
        slotProps={MENU_SLOT_PROPS}
      >
        <MenuItem onClick={handleView}>Track</MenuItem>
        <MenuItem onClick={handleDelete}>Delete</MenuItem>
      </Menu>
    </Box>
  );
};

export default ApprovalRequestActionsMenu;
