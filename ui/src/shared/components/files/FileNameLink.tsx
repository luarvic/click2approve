import FileTypeIcon from "@/shared/components/icons/FileTypeIcon";
import { StackSpacing } from "@/shared/constants/constants";
import { Link } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";

interface FileNameLinkProps {
  fileName: string;
  onClick?: () => void;
  sx?: SxProps<Theme>;
}

const fileNameLinkSx: SxProps<Theme> = {
  alignItems: "center",
  columnGap: StackSpacing.default,
  display: "inline-flex",
  textAlign: "left",
};

const FileNameLink: React.FC<FileNameLinkProps> = ({ fileName, onClick, sx }) => (
  <Link
    component={onClick ? "button" : "span"}
    onClick={onClick}
    sx={[fileNameLinkSx, ...(Array.isArray(sx) ? sx : [sx])]}
    variant="body2"
  >
    <FileTypeIcon fileName={fileName} fontSize="small" />
    {fileName}
  </Link>
);

export default FileNameLink;
