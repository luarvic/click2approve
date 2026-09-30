import { InfoOutlined } from "@mui/icons-material";
import type { SxProps } from "@mui/material";
import { IconButton, Popover, Typography } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { useId, useState } from "react";

interface HelpPopoverProps {
  compact?: boolean;
  helpText: string;
}

const compactHelpButtonSx: SxProps<Theme> = {
  height: 24,
  p: 0,
  width: 24,
};

const compactHelpIconSx: SxProps<Theme> = { fontSize: "1rem" };

const helpPopoverPaperSx: SxProps<Theme> = {
  maxWidth: 320,
  p: 2,
};

/** Displays contextual help in a popover opened from a muted help icon. */
const HelpPopover: React.FC<HelpPopoverProps> = ({ compact = false, helpText }) => {
  const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);
  const popoverId = useId();
  const isOpen = Boolean(anchorElement);

  return (
    <>
      <IconButton
        aria-describedby={isOpen ? popoverId : undefined}
        aria-expanded={isOpen}
        aria-label="Show help"
        size="small"
        onClick={(event) => setAnchorElement(event.currentTarget)}
        sx={compact ? compactHelpButtonSx : undefined}
      >
        <InfoOutlined color="action" sx={compact ? compactHelpIconSx : undefined} />
      </IconButton>
      <Popover
        anchorEl={anchorElement}
        anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
        id={isOpen ? popoverId : undefined}
        open={isOpen}
        transformOrigin={{ horizontal: "left", vertical: "top" }}
        onClose={() => setAnchorElement(null)}
        slotProps={{
          paper: { sx: helpPopoverPaperSx },
        }}
      >
        <Typography>{helpText}</Typography>
      </Popover>
    </>
  );
};

export default HelpPopover;
