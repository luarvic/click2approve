import ApprovalWorkflowFormContent from "@/features/approvalWorkflow/components/ApprovalWorkflowFormContent";
import type { ReactNode } from "react";

interface ApprovalRequestTimelineContentProps {
  children: ReactNode;
}

const ApprovalRequestTimelineContent: React.FC<
  ApprovalRequestTimelineContentProps
> = ({ children }) => (
  <ApprovalWorkflowFormContent>{children}</ApprovalWorkflowFormContent>
);

export default ApprovalRequestTimelineContent;
