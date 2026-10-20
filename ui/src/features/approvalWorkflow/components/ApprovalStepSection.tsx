import ApprovalStepHeader from "@/features/approvalWorkflow/components/ApprovalStepHeader";
import { Icons } from "@/shared/components/icons/iconStyles";
import { AccountTreeOutlined } from "@mui/icons-material";
import { Stack } from "@mui/material";
import type { ReactNode } from "react";

interface ApprovalStepSectionProps {
  accessory?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  icon?: ReactNode;
  iconLabel?: string;
  sequence: number;
}

const stepContentSpacing = 1;

const ApprovalStepSection: React.FC<ApprovalStepSectionProps> = ({
  accessory,
  actions,
  children,
  icon = <AccountTreeOutlined color={Icons.secondaryColor} fontSize="small" />,
  iconLabel,
  sequence,
}) => (
  <Stack component="li" spacing={stepContentSpacing}>
    <ApprovalStepHeader accessory={accessory} actions={actions} icon={icon} iconLabel={iconLabel} sequence={sequence} />
    {children}
  </Stack>
);

export default ApprovalStepSection;
