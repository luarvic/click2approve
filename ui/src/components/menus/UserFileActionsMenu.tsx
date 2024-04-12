import { ArrowDropDownCircle } from "@mui/icons-material";
import { Box, IconButton, Menu, MenuItem } from "@mui/material";
import { useState } from "react";
import { IUserFile } from "../../models/userFile";
import {
  MENU_ANCHOR_ORIGIN,
  MENU_SLOT_PROPS,
  MENU_TRANSFORM_ORIGIN,
} from "../../utils/constants";
import { stores } from "../../stores/stores";

interface IUserFileActionsMenuProps {
  userFile: IUserFile;
}

const UserFileActionsMenu: React.FC<IUserFileActionsMenuProps> = ({
  userFile,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleDelete = () => {
    stores.userFileStore.setCurrentUSerFile(userFile);
    stores.commonStore.setUserFileDeleteDialogIsOpen(true);
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
        <MenuItem onClick={handleDelete}>Delete</MenuItem>
      </Menu>
    </Box>
  );
};

export default UserFileActionsMenu;
