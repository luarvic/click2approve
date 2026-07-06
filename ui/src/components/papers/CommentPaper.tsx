import { Box, Paper } from "@mui/material";
import type { SxProps } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import {
  COMMENT_PAPER_SX,
  COMMENT_TEXT_SX,
} from "../../data/constants";

interface ICommentProps {
  text?: string;
  sx?: SxProps<Theme>;
}

const CommentPaper: React.FC<ICommentProps> = ({ text, sx }) => {
  return (
    <Box>
      {text && (
        <Paper
          sx={[COMMENT_PAPER_SX, ...(Array.isArray(sx) ? sx : [sx])]}
          variant="outlined"
        >
          {(text.split(/\r?\n/) as string[]).map((line, index) => (
            <Box key={index} sx={COMMENT_TEXT_SX}>
              {line}
            </Box>
          ))}
        </Paper>
      )}
    </Box>
  );
};

export default CommentPaper;
