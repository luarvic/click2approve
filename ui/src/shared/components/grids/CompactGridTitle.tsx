import type { SxProps, Theme } from "@mui/material";
import { Stack } from "@mui/material";
import type { ReactNode } from "react";

interface CompactGridTitleProps {
  badge?: ReactNode;
  children: ReactNode;
}

const compactGridTitleSx: SxProps<Theme> = {
  "& > :first-child": {
    minWidth: 0,
    overflowWrap: "anywhere",
    whiteSpace: "normal",
  },
  alignItems: "center",
  minWidth: 0,
  width: "100%",
};

const CompactGridTitle: React.FC<CompactGridTitleProps> = ({ badge, children }) => (
  <Stack direction="row" spacing={0.5} sx={compactGridTitleSx}>
    {children}
    {badge}
  </Stack>
);

export default CompactGridTitle;
