import { ControlTokens, SurfaceTokens } from "@/shared/theme/tokens";
import { InfoOutlined } from "@mui/icons-material";
import type { SxProps } from "@mui/material";
import { IconButton, Link, Popover, Typography } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { useId, useState } from "react";

interface HelpPopoverProps {
  docsHref?: string;
  helpText: string;
}

const helpButtonSx: SxProps<Theme> = {
  borderRadius: ControlTokens.borderRadius,
  color: "text.secondary",
  flexShrink: 0,
  height: 32,
  p: 0,
  width: 32,
  "&:hover": {
    bgcolor: "action.hover",
    color: "primary.main",
  },
  "&.Mui-focusVisible": {
    color: "primary.main",
    outline: "2px solid",
    outlineColor: "primary.main",
    outlineOffset: 2,
  },
  "@media (pointer: coarse)": {
    height: 44,
    width: 44,
  },
};

const helpIconSx: SxProps<Theme> = { fontSize: 18 };

const helpPopoverPaperSx: SxProps<Theme> = {
  border: 1,
  borderColor: "divider",
  borderRadius: SurfaceTokens.borderRadius,
  boxShadow: "none",
  maxWidth: 320,
  p: 2,
};

const documentationLinkSx: SxProps<Theme> = {
  display: "inline-block",
  mt: 1,
};

/** Displays contextual help in a popover opened from a muted help icon. */
const HelpPopover: React.FC<HelpPopoverProps> = ({ docsHref, helpText }) => {
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
        sx={helpButtonSx}
      >
        <InfoOutlined sx={helpIconSx} />
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
        <Typography variant="body2">{helpText}</Typography>
        {docsHref && (
          <Link
            variant="body2"
            aria-label="Read documentation (opens in a new tab)"
            href={docsHref}
            target="_blank"
            rel="noopener noreferrer"
            sx={documentationLinkSx}
          >
            Read documentation
          </Link>
        )}
      </Popover>
    </>
  );
};

export default HelpPopover;
