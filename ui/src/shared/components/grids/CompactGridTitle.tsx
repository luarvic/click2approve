import { StackSpacing } from "@/shared/theme/tokens";
import type { SxProps, Theme } from "@mui/material";
import { Stack } from "@mui/material";
import type { ReactNode } from "react";

interface CompactGridTitleProps {
  badge?: ReactNode;
  children: ReactNode;
}

const compactGridTitleSx: SxProps<Theme> = {
  "& > :first-of-type": {
    minWidth: 0,
    overflowWrap: "anywhere",
    whiteSpace: "normal",
  },
  alignItems: "center",
  minWidth: 0,
  width: "100%",
};

const CompactGridTitle: React.FC<CompactGridTitleProps> = ({ badge, children }) => (
  <Stack direction="row" spacing={StackSpacing.tight} sx={compactGridTitleSx}>
    {children}
    {badge}
  </Stack>
);

export default CompactGridTitle;
