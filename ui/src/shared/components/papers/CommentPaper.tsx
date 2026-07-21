import type { SxProps } from "@mui/material";
import { Box, Typography } from "@mui/material";
import type { Theme } from "@mui/material/styles";

interface CommentProps {
  children?: React.ReactNode;
  text?: string;
  label?: string;
  sx?: SxProps<Theme>;
}

const CommentPaper: React.FC<CommentProps> = ({ children, text, label, sx }) => {
  if (!text?.trim() && !children) {
    return null;
  }

  return (
    <Box
      sx={[
        {
          py: 0.5,
          color: "text.secondary",
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {label && (
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
      )}
      {children ??
        text?.split(/\r?\n/).map((line, index) => (
          <Typography key={index}>
            {line}
          </Typography>
        ))}
    </Box>
  );
};

export default CommentPaper;
