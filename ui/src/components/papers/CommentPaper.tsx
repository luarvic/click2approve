import { Box, Paper, SxProps } from "@mui/material";

interface ICommentProps {
  text?: string;
  sx?: SxProps;
}

const CommentPaper: React.FC<ICommentProps> = ({ text, sx }) => {
  return (
    <Box>
      {text && (
        <Paper sx={{ p: 1, mb: 1, ...sx }} variant="outlined">
          {(text.split(/\r?\n/) as string[]).map((line, index) => (
            <Box key={index} sx={{ fontStyle: "italic" }}>
              {line}
            </Box>
          ))}
        </Paper>
      )}
    </Box>
  );
};

export default CommentPaper;
