import { ApprovalStepTemplate } from "@/features/approvalStepTemplates/models/approvalStepTemplate";
import { Menus } from "@/shared/constants/constants";
import { MoreHoriz } from "@mui/icons-material";
import { Box, IconButton, Menu, MenuItem } from "@mui/material";
import { useState } from "react";

interface ApprovalStepTemplateActionsMenuProps {
  template: ApprovalStepTemplate;
  onEdit: (template: ApprovalStepTemplate) => void;
  onDelete: (template: ApprovalStepTemplate) => void;
}

const ApprovalStepTemplateActionsMenu: React.FC<
  ApprovalStepTemplateActionsMenuProps
> = ({ template, onEdit, onDelete }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box>
      <IconButton
        aria-controls={open ? "approval-step-template-actions-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={(event) => setAnchorEl(event.currentTarget)}
      >
        <MoreHoriz />
      </IconButton>
      <Menu
        id="approval-step-template-actions-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={Menus.anchorOrigin}
        transformOrigin={Menus.transformOrigin}
      >
        <MenuItem
          onClick={() => {
            onEdit(template);
            handleClose();
          }}
        >
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            onDelete(template);
            handleClose();
          }}
        >
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ApprovalStepTemplateActionsMenu;
