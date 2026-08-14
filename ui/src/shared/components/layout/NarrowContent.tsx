import type { SxProps } from "@mui/material";
import { Box } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import type { KeyboardEvent, PointerEvent, ReactNode } from "react";
import { useEffect, useState } from "react";

interface NarrowContentProps {
  children: ReactNode;
}

const defaultNarrowContentWidth = 600;
const minimumNarrowContentWidth = 600;
const resizeStep = 20;
const narrowContentWidthStorageKey = "click2approve.narrowContentWidth";

const getStoredNarrowContentWidth = (): number => {
  const storedWidth = Number(localStorage.getItem(narrowContentWidthStorageKey));

  return Number.isFinite(storedWidth) && storedWidth >= minimumNarrowContentWidth
    ? storedWidth
    : defaultNarrowContentWidth;
};

const getNarrowContentSx = (width: number): SxProps<Theme> => ({
  alignSelf: "flex-start",
  maxWidth: "100%",
  position: "relative",
  width: { sm: width },
});

const getResizeHandleSx =
  (isResizing: boolean): SxProps<Theme> =>
  (theme) => ({
    "&::after": {
      borderLeft: "2px dotted transparent",
      borderLeftColor: isResizing ? theme.palette.primary.main : "transparent",
      bottom: 0,
      content: '""',
      left: "50%",
      position: "absolute",
      top: 0,
      transform: "translateX(-50%)",
      width: 0,
    },
    "&:focus-visible::after, &:hover::after": {
      borderLeftColor: theme.palette.primary.main,
    },
    bottom: 0,
    cursor: "col-resize",
    position: "absolute",
    right: -6,
    top: 0,
    width: 12,
    zIndex: 1,
  });

/** Provides a responsive, narrow content area for forms and focused pages. */
const NarrowContent: React.FC<NarrowContentProps> = ({ children }) => {
  const [width, setWidth] = useState(getStoredNarrowContentWidth);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    localStorage.setItem(narrowContentWidthStorageKey, width.toString());
  }, [width]);

  useEffect(() => {
    if (!isResizing) {
      return undefined;
    }

    const stopResizing = () => setIsResizing(false);

    window.addEventListener("pointerup", stopResizing);
    window.addEventListener("pointercancel", stopResizing);

    return () => {
      window.removeEventListener("pointerup", stopResizing);
      window.removeEventListener("pointercancel", stopResizing);
    };
  }, [isResizing]);

  const resizeTo = (newWidth: number) => {
    setWidth(Math.max(minimumNarrowContentWidth, newWidth));
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsResizing(true);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!isResizing) {
      return;
    }

    const contentLeft = event.currentTarget.parentElement?.getBoundingClientRect().left;

    if (contentLeft !== undefined) {
      resizeTo(event.clientX - contentLeft);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      resizeTo(width - resizeStep);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      resizeTo(width + resizeStep);
    }
  };

  return (
    <Box sx={getNarrowContentSx(width)}>
      {children}
      <Box
        aria-label="Resize content width"
        aria-orientation="vertical"
        aria-valuemin={minimumNarrowContentWidth}
        aria-valuenow={width}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        role="separator"
        sx={getResizeHandleSx(isResizing)}
        tabIndex={0}
      />
    </Box>
  );
};

export default NarrowContent;
