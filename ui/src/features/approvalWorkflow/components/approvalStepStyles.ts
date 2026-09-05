import type { SxProps, Theme } from "@mui/material";
export const AssigneeTypeFieldMinWidth = 130;
export const ApprovalStepStyles = {
  addStepButtonSx: { mt: 2 } as SxProps<Theme>,
  stepHeaderSpacing: 1,
  stepStackSpacing: 2,
  stepHeaderSx: { mb: 1.5 } as SxProps<Theme>,
  stepTitleSx: { flexGrow: 1 } as SxProps<Theme>,
  stepActionSpacing: 0.5,
  assigneeStackSpacing: 1,
  assigneeTypeFieldSx: {
    minWidth: AssigneeTypeFieldMinWidth,
  } as SxProps<Theme>,
  removeAssigneeButtonSx: {
    alignSelf: { xs: "flex-end", sm: "center" },
    height: 40,
    width: 40,
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
