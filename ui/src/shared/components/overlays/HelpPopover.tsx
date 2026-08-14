import { InfoOutlined } from "@mui/icons-material";
import type { SxProps } from "@mui/material";
import { IconButton, Popover, Typography } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { useId, useState } from "react";

interface HelpPopoverProps {
  helpText: string;
}

const helpPopoverPaperSx: SxProps<Theme> = {
  maxWidth: 320,
  p: 2,
};

/** Displays contextual help in a popover opened from a muted help icon. */
const HelpPopover: React.FC<HelpPopoverProps> = ({ helpText }) => {
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
      >
        <InfoOutlined color="action" />
      </IconButton>
      <Popover
        anchorEl={anchorElement}
        anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
        id={isOpen ? popoverId : undefined}
        open={isOpen}
        PaperProps={{ sx: helpPopoverPaperSx }}
        transformOrigin={{ horizontal: "left", vertical: "top" }}
        onClose={() => setAnchorElement(null)}
      >
        <Typography>{helpText}</Typography>
      </Popover>
    </>
  );
};

export default HelpPopover;
