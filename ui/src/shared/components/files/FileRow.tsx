import { Stack } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import type { ReactNode } from "react";

interface FileRowProps {
  children: ReactNode;
  sx?: SxProps<Theme>;
}

const fileRowSx: SxProps<Theme> = {
  minHeight: 24,
};

const FileRow: React.FC<FileRowProps> = ({ children, sx }) => (
  <Stack alignItems="center" direction="row" sx={[fileRowSx, ...(Array.isArray(sx) ? sx : [sx])]}>
    {children}
  </Stack>
);

export default FileRow;
