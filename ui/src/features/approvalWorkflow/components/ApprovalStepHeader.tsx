import { ApprovalStepStyles } from "@/features/approvalWorkflow/components/approvalStepStyles";
import { Flex } from "@/shared/components/layout/flexStyles";
import { StackSpacing } from "@/shared/theme/tokens";
import type { SxProps } from "@mui/material";
import { Box, Stack } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import type { ReactNode } from "react";
import ApprovalStepTitle from "./ApprovalStepTitle";

interface ApprovalStepHeaderProps {
  accessory?: ReactNode;
  actions?: ReactNode;
  icon?: ReactNode;
  iconLabel?: string;
  details?: ReactNode;
  hasBottomMargin?: boolean;
  sequence: number;
  showTitle?: boolean;
}

const headerSx: SxProps<Theme> = { mb: ApprovalStepStyles.stepHeaderSpacing };
const iconSx = { display: "inline-flex", flexShrink: 0 } as const;
const actionsSx = { display: "flex", flexShrink: 0, gap: ApprovalStepStyles.stepActionSpacing, ml: "auto" } as const;
const titleRowSx: SxProps<Theme> = {
  alignItems: "center",
  display: "flex",
  flexWrap: "wrap",
  gap: StackSpacing.default,
};

const ApprovalStepHeader: React.FC<ApprovalStepHeaderProps> = ({
  accessory,
  actions,
  icon,
  iconLabel,
  details,
  hasBottomMargin = false,
  sequence,
  showTitle = true,
}) => (
  <Stack
    direction="row"
    spacing={ApprovalStepStyles.stepHeaderSpacing}
    sx={[Flex.alignCenterSx, hasBottomMargin && headerSx]}
  >
    <Stack sx={Flex.growSx}>
      <Stack direction="row" sx={titleRowSx}>
        {icon && (
          <Box component="span" role={iconLabel ? "img" : undefined} aria-label={iconLabel} sx={iconSx}>
            {icon}
          </Box>
        )}
        {showTitle && <ApprovalStepTitle sequence={sequence} />}
        {details}
        {accessory}
        {actions && <Box sx={actionsSx}>{actions}</Box>}
      </Stack>
    </Stack>
  </Stack>
);

export default ApprovalStepHeader;
