import ExpandableSection from "@/shared/components/layout/ExpandableSection";
import { StackSpacing } from "@/shared/theme/tokens";
import { Stack, type SxProps, type Theme } from "@mui/material";
import type { ReactNode } from "react";

const cardColumnSpacing = 4;
const cardSectionsSx: SxProps<Theme> = {
  "& > section:last-child > .approval-request-field:last-child": { pb: 0 },
};

interface ApprovalRequestCardLayoutProps {
  activity: ReactNode;
  artifacts?: ReactNode;
  defaultExpanded?: boolean;
  details: ReactNode;
  expandable?: boolean;
  status?: ReactNode;
  title: string;
}

const ApprovalRequestCardLayout: React.FC<ApprovalRequestCardLayoutProps> = ({
  activity,
  artifacts,
  defaultExpanded = true,
  details,
  expandable = false,
  status,
  title,
}) => (
  <ExpandableSection
    actions={status}
    compactHeader
    defaultExpanded={defaultExpanded}
    expandable={expandable}
    headerSpacing={StackSpacing.loose}
    headingVariant="cardTitle"
    title={title}
  >
    <Stack spacing={cardColumnSpacing} sx={cardSectionsSx}>
      {details}
      {artifacts}
      {activity}
    </Stack>
  </ExpandableSection>
);

export default ApprovalRequestCardLayout;
