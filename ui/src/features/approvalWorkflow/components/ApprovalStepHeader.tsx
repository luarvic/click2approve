import { Dialogs, Flex, StackSpacing } from "@/shared/constants/constants";
import type { SxProps } from "@mui/material";
import { Stack } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import type { ReactNode } from "react";
import ApprovalStepTitle from "./ApprovalStepTitle";

interface ApprovalStepHeaderProps {
  accessory?: ReactNode;
  details?: ReactNode;
  hasBottomMargin?: boolean;
  sequence: number;
  showTitle?: boolean;
}

const headerSx: SxProps<Theme> = { mb: Dialogs.stepHeaderSpacing };
const titleRowSx: SxProps<Theme> = {
  alignItems: "center",
  display: "flex",
  flexWrap: "wrap",
  gap: StackSpacing.default,
};

const ApprovalStepHeader: React.FC<ApprovalStepHeaderProps> = ({
  accessory,
  details,
  hasBottomMargin = false,
  sequence,
  showTitle = true,
}) => (
  <Stack
    direction="row"
    spacing={Dialogs.stepHeaderSpacing}
    alignItems="center"
    sx={hasBottomMargin ? headerSx : undefined}
  >
    <Stack sx={Flex.growSx}>
      <Stack direction="row" sx={titleRowSx}>
        {showTitle && <ApprovalStepTitle sequence={sequence} />}
        {details}
        {accessory}
      </Stack>
    </Stack>
  </Stack>
);

export default ApprovalStepHeader;
