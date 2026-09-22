import type { SxProps } from "@mui/material";
import { Box } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import type { ReactNode } from "react";

interface NarrowContentProps {
  children: ReactNode;
}

const narrowContentWidth = 960;

const narrowContentSx: SxProps<Theme> = {
  alignSelf: "flex-start",
  maxWidth: "100%",
  width: { sm: narrowContentWidth },
};

/** Provides a responsive, narrow content area for forms and focused pages. */
const NarrowContent: React.FC<NarrowContentProps> = ({ children }) => {
  return <Box sx={narrowContentSx}>{children}</Box>;
};

export default NarrowContent;
