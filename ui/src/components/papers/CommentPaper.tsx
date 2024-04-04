import { Box, Paper, SxProps } from "@mui/material";

interface ICommentProps {
  text?: string;
  sx?: SxProps;
}

const CommentPaper: React.FC<ICommentProps> = ({ text, sx }) => {
  return (
    <Box>
      {text && (
        <Paper sx={{ p: 1, mb: 1, background: "#f5f5f5", ...sx }} elevation={0}>
          {(text.split(/\r?\n/) as string[]).map((line, index) => (
            <Box key={index}>{line}</Box>
          ))}
        </Paper>
      )}
    </Box>
  );
};

export default CommentPaper;
