import FileTypeIcon from "@/shared/components/icons/FileTypeIcon";
import { StackSpacing } from "@/shared/theme/tokens";
import type { TypographyProps } from "@mui/material";
import { Link } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";

interface FileNameLinkProps {
  fileName: string;
  onClick?: () => void;
  sx?: SxProps<Theme>;
  variant?: TypographyProps["variant"];
}

const fileNameLinkSx: SxProps<Theme> = {
  alignItems: "center",
  columnGap: StackSpacing.default,
  display: "inline-flex",
  textAlign: "left",
};

const FileNameLink: React.FC<FileNameLinkProps> = ({ fileName, onClick, sx, variant = "body2" }) => (
  <Link
    component={onClick ? "button" : "span"}
    onClick={onClick}
    sx={[fileNameLinkSx, ...(Array.isArray(sx) ? sx : [sx])]}
    variant={variant}
  >
    <FileTypeIcon fileName={fileName} fontSize="small" />
    {fileName}
  </Link>
);

export default FileNameLink;
