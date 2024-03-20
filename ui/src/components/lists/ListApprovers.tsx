import { Box, Stack, SxProps } from "@mui/material";

interface IListApproversProps {
  approvers: string[];
  sx?: SxProps;
}

export const ListApprovers: React.FC<IListApproversProps> = ({
  approvers,
  sx,
}) => {
  return (
    <Stack
      direction="column"
      justifyContent="flex-start"
      alignItems="flex-start"
      sx={{ ...sx }}
    >
      {approvers.map((approver, index) => (
        <Box key={index}>{approver.toLowerCase()}</Box>
      ))}
    </Stack>
  );
};
