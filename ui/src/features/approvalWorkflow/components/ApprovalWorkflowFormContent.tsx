import NarrowContent from "@/shared/components/layout/NarrowContent";
import type { ReactNode } from "react";

interface ApprovalWorkflowFormContentProps {
  children: ReactNode;
}

/** Provides the consistent, narrow content area used by approval workflows. */
const ApprovalWorkflowFormContent: React.FC<ApprovalWorkflowFormContentProps> = ({
  children,
}) => <NarrowContent>{children}</NarrowContent>;

export default ApprovalWorkflowFormContent;
