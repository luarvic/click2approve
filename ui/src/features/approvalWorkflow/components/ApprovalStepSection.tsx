import ApprovalStepHeader from "@/features/approvalWorkflow/components/ApprovalStepHeader";
import { Stack } from "@mui/material";
import type { ReactNode } from "react";

interface ApprovalStepSectionProps {
  accessory?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  icon: ReactNode;
  iconLabel?: string;
  sequence: number;
}

const stepContentSpacing = 1;

const ApprovalStepSection: React.FC<ApprovalStepSectionProps> = ({
  accessory,
  actions,
  children,
  icon,
  iconLabel,
  sequence,
}) => (
  <Stack component="li" spacing={stepContentSpacing}>
    <ApprovalStepHeader accessory={accessory} actions={actions} icon={icon} iconLabel={iconLabel} sequence={sequence} />
    {children}
  </Stack>
);

export default ApprovalStepSection;
