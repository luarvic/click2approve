import { StackSpacing } from "@/shared/theme/tokens";
import { ExpandMore } from "@mui/icons-material";
import { Collapse, IconButton, Stack, Typography } from "@mui/material";
import { useState, type ReactNode } from "react";

const cardColumnSpacing = 2;
const activityColumnFlex = 1;
const detailsColumnFlex = 2;

interface ApprovalRequestCardLayoutProps {
  activity: ReactNode;
  artifacts?: ReactNode;
  defaultExpanded?: boolean;
  details: ReactNode;
  expandable?: boolean;
  title: string;
}

const detailsColumnSx = {
  flex: detailsColumnFlex,
  minWidth: 0,
} as const;
const activityColumnSx = {
  flex: activityColumnFlex,
  minWidth: 0,
} as const;
const headerRowSx = {
  alignItems: "center",
  justifyContent: "space-between",
} as const;

const ApprovalRequestCardLayout: React.FC<ApprovalRequestCardLayoutProps> = ({
  activity,
  artifacts,
  defaultExpanded = true,
  details,
  expandable = false,
  title,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const content = (
    <Stack direction={{ xs: "column", md: "row" }} spacing={cardColumnSpacing}>
      <Stack spacing={cardColumnSpacing} sx={detailsColumnSx}>
        {details}
        {artifacts}
      </Stack>
      <Stack sx={activityColumnSx}>{activity}</Stack>
    </Stack>
  );

  return (
    <Stack spacing={StackSpacing.default}>
      <Stack direction="row" spacing={StackSpacing.tight} sx={headerRowSx}>
        <Typography component="h2" variant="h6" color="text.secondary">
          {title}
        </Typography>
        {expandable && (
          <IconButton
            aria-expanded={expanded}
            aria-label={`${expanded ? "Collapse" : "Expand"} ${title}`}
            onClick={(event) => {
              event.stopPropagation();
              setExpanded((current) => !current);
            }}
          >
            <ExpandMore />
          </IconButton>
        )}
      </Stack>
      {expandable ? (
        <Collapse in={expanded} unmountOnExit>
          {content}
        </Collapse>
      ) : (
        content
      )}
    </Stack>
  );
};

export default ApprovalRequestCardLayout;
