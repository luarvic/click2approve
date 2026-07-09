import { Lists } from "@/shared/constants/constants";
import type { SxProps } from "@mui/material";
import { Box, Stack } from "@mui/material";
import type { Theme } from "@mui/material/styles";

interface ApproversListProps {
  approvers: string[];
  direction: "row" | "row-reverse" | "column" | "column-reverse" | undefined;
  sx?: SxProps<Theme>;
}

const ApproversList: React.FC<ApproversListProps> = ({
  approvers,
  direction,
  sx,
}) => {
  return (
    <Stack
      spacing={Lists.itemSpacing}
      direction={direction}
      justifyContent="flex-start"
      alignItems="flex-start"
      sx={[Lists.overflowHiddenSx, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {approvers.map((approver, index) => (
        <Box key={index}>{approver.toLowerCase()}</Box>
      ))}
    </Stack>
  );
};

export default ApproversList;
