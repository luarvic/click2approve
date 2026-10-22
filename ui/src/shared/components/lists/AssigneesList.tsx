import { Lists } from "@/shared/components/lists/listStyles";
import type { SxProps } from "@mui/material";
import { Box, Stack } from "@mui/material";
import type { Theme } from "@mui/material/styles";

interface AssigneesListProps {
  assignees: string[];
  direction: "row" | "row-reverse" | "column" | "column-reverse" | undefined;
  sx?: SxProps<Theme>;
}

const startAlignedSx = {
  justifyContent: "flex-start",
  alignItems: "flex-start",
} as const;

const AssigneesList: React.FC<AssigneesListProps> = ({ assignees, direction, sx }) => {
  return (
    <Stack
      spacing={Lists.itemSpacing}
      direction={direction}
      sx={[startAlignedSx, Lists.overflowHiddenSx, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {assignees.map((assignee, index) => (
        <Box key={index}>{assignee.toLowerCase()}</Box>
      ))}
    </Stack>
  );
};

export default AssigneesList;
