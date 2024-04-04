import { Box, Stack, SxProps } from "@mui/material";

interface IApproversListProps {
  approvers: string[];
  direction: "row" | "row-reverse" | "column" | "column-reverse" | undefined;
  sx?: SxProps;
}

const ApproversList: React.FC<IApproversListProps> = ({
  approvers,
  direction,
  sx,
}) => {
  return (
    <Stack
      spacing={1}
      direction={direction}
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

export default ApproversList;
