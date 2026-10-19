import ExpandableSection from "@/shared/components/layout/ExpandableSection";
import { StackSpacing } from "@/shared/theme/tokens";
import { Stack } from "@mui/material";
import { Children, useId, type ReactNode } from "react";

interface DiscussionThreadProps {
  children: ReactNode;
  participants: ReactNode;
  title: string;
}

const DiscussionThread: React.FC<DiscussionThreadProps> = ({ children, participants, title }) => {
  const titleId = useId();
  return (
    <Stack component="section" aria-labelledby={titleId} spacing={StackSpacing.loose}>
      <ExpandableSection defaultExpanded={false} headingId={titleId} title={title}>
        {participants}
      </ExpandableSection>
      {Children.count(children) > 0 && <Stack spacing={StackSpacing.loose}>{children}</Stack>}
    </Stack>
  );
};

export default DiscussionThread;
