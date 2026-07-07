import { MoreHoriz } from "@mui/icons-material";
import { Box, IconButton, Menu, MenuItem } from "@mui/material";
import { useState } from "react";
import {
  MENU_ANCHOR_ORIGIN,
  MENU_TRANSFORM_ORIGIN,
} from "../../data/constants";
import { ITenant } from "../../models/tenant";

interface ITenantActionsMenuProps {
  tenant: ITenant;
  onEdit: (tenant: ITenant) => void;
  onDelete: (tenant: ITenant) => void;
}

const TenantActionsMenu: React.FC<ITenantActionsMenuProps> = ({
  tenant,
  onEdit,
  onDelete,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box>
      <IconButton
        aria-controls={open ? "tenant-actions-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={(event) => setAnchorEl(event.currentTarget)}
      >
        <MoreHoriz />
      </IconButton>
      <Menu
        id="tenant-actions-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={MENU_ANCHOR_ORIGIN}
        transformOrigin={MENU_TRANSFORM_ORIGIN}
      >
        <MenuItem
          onClick={() => {
            onEdit(tenant);
            handleClose();
          }}
        >
          Edit
        </MenuItem>
        <MenuItem
          disabled={!tenant.isOwner}
          onClick={() => {
            onDelete(tenant);
            handleClose();
          }}
        >
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default TenantActionsMenu;
