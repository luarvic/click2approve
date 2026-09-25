import type { SxProps, Theme } from "@mui/material";
export const AssigneeTypeFieldMinWidth = 130;
const stepHeaderSpacing = 1;

export const ApprovalStepStyles = {
  contentSx: { pr: 0 } as const,
  assigneeAccordionSx: { bgcolor: "transparent", boxShadow: "none", "&::before": { display: "none" } } as const,
  assigneeSummarySx: { minHeight: 0, px: 0, py: 0, "& .MuiAccordionSummary-content": { my: 0 } } as const,
  assigneeDetailsSx: { px: 0, pb: 0, pt: stepHeaderSpacing } as const,
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
