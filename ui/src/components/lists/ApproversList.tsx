import { Box, Stack, SxProps } from "@mui/material";

interface IApproversListProps {
  approvers: string[];
  sx?: SxProps;
}

export const ApproversList: React.FC<IApproversListProps> = ({
  approvers,
  sx,
}) => {
  return (
    <Stack
      direction="column"
      justifyContent="flex-start"
      alignItems="flex-start"
      sx={{ ...sx, overflow: "hidden" }}
    >
      {approvers.map((approver, index) => (
        <Box key={index}>{approver.toLowerCase()}</Box>
      ))}
    </Stack>
  );
};
