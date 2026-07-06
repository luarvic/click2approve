import { Box, Stack } from "@mui/material";
import type { SxProps } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import {
  LIST_ITEM_SPACING,
  LIST_OVERFLOW_HIDDEN_SX,
} from "../../data/constants";

interface IApproversListProps {
  approvers: string[];
  direction: "row" | "row-reverse" | "column" | "column-reverse" | undefined;
  sx?: SxProps<Theme>;
}

const ApproversList: React.FC<IApproversListProps> = ({
  approvers,
  direction,
  sx,
}) => {
  return (
    <Stack
      spacing={LIST_ITEM_SPACING}
      direction={direction}
      justifyContent="flex-start"
      alignItems="flex-start"
      sx={[LIST_OVERFLOW_HIDDEN_SX, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {approvers.map((approver, index) => (
        <Box key={index}>{approver.toLowerCase()}</Box>
      ))}
    </Stack>
  );
};

export default ApproversList;
