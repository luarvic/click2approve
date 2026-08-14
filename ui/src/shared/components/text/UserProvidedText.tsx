import type { SxProps } from "@mui/material";
import { Typography } from "@mui/material";
import type { Theme } from "@mui/material/styles";

interface UserProvidedTextProps {
  color?: string;
  sx?: SxProps<Theme>;
  text?: string | null;
}

const userProvidedTextSx: SxProps<Theme> = {
  overflowWrap: "anywhere",
  whiteSpace: "pre-wrap",
};

const UserProvidedText: React.FC<UserProvidedTextProps> = ({ color, sx, text }) => {
  const trimmedText = text?.trim();

  return trimmedText ? (
    <Typography color={color} sx={[userProvidedTextSx, ...(Array.isArray(sx) ? sx : [sx])]} variant="body1">
      {trimmedText}
    </Typography>
  ) : null;
};

export default UserProvidedText;
