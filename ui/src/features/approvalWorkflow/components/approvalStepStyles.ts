import { alpha, type SxProps, type Theme } from "@mui/material";
export const AssigneeTypeFieldMinWidth = 130;
const stepHeaderSpacing = 1;

export const ApprovalStepStyles = {
  addStepButtonSx: { mt: 2 } as SxProps<Theme>,
  stepHeaderSpacing,
  stepStackSpacing: 2,
  stepHeaderSx: { mb: 1.5 } as SxProps<Theme>,
  stepTitleSx: { flexGrow: 1 } as SxProps<Theme>,
  stepActionSpacing: 0.5,
  assigneeStackSpacing: 1,
  assigneeTypeFieldSx: {
    minWidth: AssigneeTypeFieldMinWidth,
  } as SxProps<Theme>,
  removeAssigneeButtonSx: {
    alignSelf: "flex-start",
    mt: 1,
  } as SxProps<Theme>,
  approvalStepSx: {
    border: "1px solid",
    borderColor: "divider",
    borderRadius: 1,
    p: 2,
  } as SxProps<Theme>,
  approvalBoxSx: {
    bgcolor: "action.hover",
    borderRadius: 1,
    p: 2,
  } as SxProps<Theme>,
} as const;

export const approvalStepIconSx: SxProps<Theme> = (theme) => ({
  color: alpha(theme.palette.text.secondary, 0.65),
});
