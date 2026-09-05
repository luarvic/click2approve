import { Lists } from "@/shared/components/lists/listStyles";
import type { SxProps } from "@mui/material";
import { Box, Stack } from "@mui/material";
import type { Theme } from "@mui/material/styles";

interface AssigneesListProps {
  assignees: string[];
  direction: "row" | "row-reverse" | "column" | "column-reverse" | undefined;
  sx?: SxProps<Theme>;
}

const AssigneesList: React.FC<AssigneesListProps> = ({ assignees, direction, sx }) => {
  return (
    <Stack
      spacing={Lists.itemSpacing}
      direction={direction}
      justifyContent="flex-start"
      alignItems="flex-start"
      sx={[Lists.overflowHiddenSx, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {assignees.map((assignee, index) => (
        <Box key={index}>{assignee.toLowerCase()}</Box>
      ))}
    </Stack>
  );
};

export default AssigneesList;
