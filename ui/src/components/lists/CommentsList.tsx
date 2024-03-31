import { Box, Stack, SxProps } from "@mui/material";

interface ICommentsListProps {
  approvalRequestComment?: string;
  approverComment?: string;
  sx?: SxProps;
}

export const CommentsList: React.FC<ICommentsListProps> = ({
  approvalRequestComment,
  approverComment,
  sx,
}) => {
  return (
    <Stack>
      {approvalRequestComment &&
        (approvalRequestComment.split(/\r?\n/) as string[]).map(
          (line, index) => <Box key={index}>{line}</Box>
        )}
      {approverComment && (
        <>
          <Box key="separator">{">>>"}</Box>
          {(approverComment.split(/\r?\n/) as string[]).map((line, index) => (
            <Box key={index}>{line}</Box>
          ))}
        </>
      )}
    </Stack>
  );
};
