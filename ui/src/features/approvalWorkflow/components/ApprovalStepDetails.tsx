import { approvalStepIconSx } from "@/features/approvalWorkflow/components/approvalStepStyles";
import ApprovalStepAssignees from "@/features/approvalWorkflow/components/ApprovalStepAssignees";
import {
  ApprovalStep,
  ApprovalStepMode,
  ApprovalStepVisibilityMode,
} from "@/features/approvalWorkflow/models/approvalStep";
import { StackSpacing } from "@/shared/theme/tokens";
import {
  AttachFile,
  ChecklistRtlOutlined,
  CommentOutlined,
  DrawOutlined,
  RuleOutlined,
  VisibilityOffOutlined,
  VisibilityOutlined,
} from "@mui/icons-material";
import { Box, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

export type ApprovalStepAttribute = "completion" | "visibility" | "requirements" | "assignees" | "participants";

interface ApprovalStepDetailsProps {
  attributes?: readonly ApprovalStepAttribute[];
  participants?: ReactNode;
  step: ApprovalStep;
}

const defaultAttributes: readonly ApprovalStepAttribute[] = ["completion", "visibility", "requirements", "assignees"];

const detailsSx = {
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  alignItems: "center",
  columnGap: StackSpacing.default,
  rowGap: StackSpacing.tight,
  color: "text.secondary",
  minWidth: 0,
  mb: 1,
} as const;
const detailItemSx = {
  display: "inline-flex",
  alignItems: "center",
  gap: StackSpacing.tight,
  minWidth: 0,
  maxWidth: "100%",
} as const;
const detailIconSx = { display: "inline-flex", flexShrink: 0 } as const;
const detailTextSx = { minWidth: 0, overflowWrap: "anywhere" } as const;

const ApprovalStepDetails: React.FC<ApprovalStepDetailsProps> = ({
  attributes = defaultAttributes,
  participants,
  step,
}) => {
  const allAssignees = step.mode === ApprovalStepMode.All;
  const completionLabel = allAssignees ? "All assignees" : "Any assignee";
  const visibilityLabel =
    step.visibilityMode === ApprovalStepVisibilityMode.OrganizationEmployees
      ? "Assignees and organization participants"
      : step.visibilityMode === ApprovalStepVisibilityMode.AssigneesOnly
        ? "Assignees only"
        : "All participants";
  const requirements = [
    step.isCommentRequired && {
      icon: <CommentOutlined sx={approvalStepIconSx} fontSize="small" />,
      label: "Comment required",
      ariaLabel: `Step ${step.sequence} requires a comment`,
    },
    step.isElectronicSignatureRequired && {
      icon: <DrawOutlined sx={approvalStepIconSx} fontSize="small" />,
      label: "Electronic signature required",
      ariaLabel: `Step ${step.sequence} requires an electronic signature`,
    },
    step.isAttachmentRequired && {
      icon: <AttachFile sx={approvalStepIconSx} fontSize="small" />,
      label: "Attachment required",
      ariaLabel: `Step ${step.sequence} requires an attachment`,
    },
  ].filter((requirement) => requirement !== false && requirement !== undefined);
  const items: { ariaLabel: string; icon: ReactNode; label: string }[] = attributes.includes("completion")
    ? [
        {
          ariaLabel: `Step ${step.sequence} completion rule ${completionLabel}`,
          icon: allAssignees ? (
            <ChecklistRtlOutlined sx={approvalStepIconSx} fontSize="small" />
          ) : (
            <RuleOutlined sx={approvalStepIconSx} fontSize="small" />
          ),
          label: completionLabel,
        },
      ]
    : [];
  if (attributes.includes("visibility"))
    items.push({
      ariaLabel: `Step ${step.sequence} visibility ${visibilityLabel}`,
      icon:
        step.visibilityMode === undefined || step.visibilityMode === ApprovalStepVisibilityMode.AllParticipants ? (
          <VisibilityOutlined sx={approvalStepIconSx} fontSize="small" />
        ) : (
          <VisibilityOffOutlined sx={approvalStepIconSx} fontSize="small" />
        ),
      label: visibilityLabel,
    });
  if (attributes.includes("requirements")) items.push(...requirements);
  return (
    <Stack component="section" aria-label={`Step ${step.sequence} details`} sx={detailsSx}>
      {items.map(({ ariaLabel, icon, label }) => (
        <Box key={ariaLabel} aria-label={ariaLabel} sx={detailItemSx}>
          <Box component="span" sx={detailIconSx}>
            {icon}
          </Box>
          <Typography variant="body2" sx={detailTextSx}>
            {label}
          </Typography>
        </Box>
      ))}
      {attributes.includes("assignees") && (
        <ApprovalStepAssignees assignees={(step.assignees ?? []).filter(Boolean)} sequence={step.sequence} />
      )}
      {attributes.includes("participants") && participants}
    </Stack>
  );
};

export default ApprovalStepDetails;
