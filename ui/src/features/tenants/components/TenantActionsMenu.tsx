import { Tenant } from "@/features/tenants/models/tenant";
import { Menus } from "@/shared/constants/constants";
import { MoreHoriz } from "@mui/icons-material";
import { Box, IconButton, Menu, MenuItem } from "@mui/material";
import { useState } from "react";

interface TenantActionsMenuProps {
  tenant: Tenant;
  onEdit: (tenant: Tenant) => void;
  onDelete: (tenant: Tenant) => void;
}

const TenantActionsMenu: React.FC<TenantActionsMenuProps> = ({
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
        anchorOrigin={Menus.anchorOrigin}
        transformOrigin={Menus.transformOrigin}
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
