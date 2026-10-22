import { approvalStepIconSx } from "@/features/approvalWorkflow/components/approvalStepStyles";
import ApprovalStepHeader from "@/features/approvalWorkflow/components/ApprovalStepHeader";
import { AccountTreeOutlined } from "@mui/icons-material";
import { Stack } from "@mui/material";
import type { ReactNode } from "react";

interface ApprovalStepSectionProps {
  accessory?: ReactNode;
  actions?: ReactNode;
  actionLabel?: string;
  label?: string;
  component?: "li" | "section";
  expandedDetails?: ReactNode;
  children?: ReactNode;
  icon?: ReactNode;
  iconLabel?: string;
  sequence: number;
}

const stepContentSpacing = 1;

const ApprovalStepSection: React.FC<ApprovalStepSectionProps> = ({
  accessory,
  actions,
  actionLabel,
  label,
  component = "li",
  expandedDetails,
  children,
  icon = <AccountTreeOutlined sx={approvalStepIconSx} fontSize="small" />,
  iconLabel,
  sequence,
}) => (
  <Stack component={component} spacing={stepContentSpacing}>
    <ApprovalStepHeader
      accessory={accessory}
      actions={actions}
      actionLabel={actionLabel}
      label={label}
      expandedDetails={expandedDetails}
      icon={icon}
      iconLabel={iconLabel}
      sequence={sequence}
    />
    {children}
  </Stack>
);

export default ApprovalStepSection;
