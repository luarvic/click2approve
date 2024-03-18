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
      {approvers.map((approver) => (
        <Box>{approver.toLowerCase()}</Box>
      ))}
    </Stack>
  );
};
