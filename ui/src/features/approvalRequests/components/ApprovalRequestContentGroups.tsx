import { StackSpacing } from "@/shared/constants/constants";
import { Stack } from "@mui/material";
import { Children, type ReactNode } from "react";

interface ApprovalRequestContentGroupsProps {
  content?: ReactNode;
  header?: ReactNode;
  metadata?: ReactNode;
}

const ApprovalRequestContentGroups: React.FC<ApprovalRequestContentGroupsProps> = ({
  content,
  header,
  metadata,
}) => {
  const groups = Children.toArray([header, content, metadata]);

  return <Stack spacing={StackSpacing.loose}>{groups}</Stack>;
};

export default ApprovalRequestContentGroups;
