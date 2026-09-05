import { StackSpacing } from "@/shared/theme/tokens";
import { Box } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import type { ReactNode } from "react";

interface ReplacedFileGroupProps {
  children: ReactNode;
}

const replacedFileGroupSx: SxProps<Theme> = {
  borderLeft: (theme) => `1px solid ${theme.palette.divider}`,
  paddingLeft: (theme) => theme.spacing(StackSpacing.default),
};

const ReplacedFileGroup: React.FC<ReplacedFileGroupProps> = ({ children }) => (
  <Box sx={replacedFileGroupSx}>{children}</Box>
);

export default ReplacedFileGroup;
