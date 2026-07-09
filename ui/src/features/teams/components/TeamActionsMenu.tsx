import { Team } from "@/features/teams/models/team";
import { Menus } from "@/shared/constants/constants";
import { MoreHoriz } from "@mui/icons-material";
import { Box, IconButton, Menu, MenuItem } from "@mui/material";
import { useState } from "react";

interface TeamActionsMenuProps {
  team: Team;
  onEdit: (team: Team) => void;
  onDelete: (team: Team) => void;
}

const TeamActionsMenu: React.FC<TeamActionsMenuProps> = ({
  team,
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
        aria-controls={open ? "team-actions-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={(event) => setAnchorEl(event.currentTarget)}
      >
        <MoreHoriz />
      </IconButton>
      <Menu
        id="team-actions-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={Menus.anchorOrigin}
        transformOrigin={Menus.transformOrigin}
      >
        <MenuItem
          onClick={() => {
            onEdit(team);
            handleClose();
          }}
        >
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            onDelete(team);
            handleClose();
          }}
        >
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default TeamActionsMenu;
