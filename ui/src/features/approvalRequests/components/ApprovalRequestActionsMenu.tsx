import { stores } from "@/app/stores";
import { ApprovalRequest } from "@/features/approvalRequests/models/approvalRequest";
import { ApprovalRequestStatus } from "@/features/approvalRequests/models/approvalRequestStatus";
import { Menus } from "@/shared/constants/constants";
import { MoreHoriz } from "@mui/icons-material";
import { Box, IconButton, Menu, MenuItem } from "@mui/material";
import { useState } from "react";

interface ApprovalRequestActionsMenuProps {
  approvalRequest: ApprovalRequest;
}

const ApprovalRequestActionsMenu: React.FC<
  ApprovalRequestActionsMenuProps
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
    stores.approvalRequestStore.setCurrent(approvalRequest);
    stores.commonStore.setApprovalRequestViewDialogIsOpen(true);
    handleClose();
  };
  const handleDelete = () => {
    stores.approvalRequestStore.setCurrent(approvalRequest);
    stores.commonStore.setApprovalRequestDeleteDialogIsOpen(true);
    handleClose();
  };
  const handleClone = () => {
    stores.approvalRequestStore.setRequestToClone(approvalRequest);
    stores.commonStore.setApprovalRequestSubmitDialogIsOpen(true);
    handleClose();
  };
  const handleEditSteps = () => {
    stores.approvalRequestStore.setCurrent(approvalRequest);
    stores.commonStore.setApprovalRequestStepsDialogIsOpen(true);
    handleClose();
  };
  const canEditSteps =
    approvalRequest.status === ApprovalRequestStatus.Submitted;

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
        <MenuItem onClick={handleView}>Track</MenuItem>
        <MenuItem onClick={handleClone}>Clone</MenuItem>
        {canEditSteps && (
          <MenuItem onClick={handleEditSteps}>Edit steps</MenuItem>
        )}
        <MenuItem onClick={handleDelete}>Delete</MenuItem>
      </Menu>
    </Box>
  );
};

export default ApprovalRequestActionsMenu;
