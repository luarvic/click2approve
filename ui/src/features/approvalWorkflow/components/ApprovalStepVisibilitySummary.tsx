import {
  ApprovalStep,
} from "@/features/approvalWorkflow/models/approvalStep";
import {
  Icons,
} from "@/shared/constants/constants";
import { VisibilityOff } from "@mui/icons-material";
import type { SxProps } from "@mui/material";
import {
  Box,
  IconButton,
  Typography,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";

interface ApprovalStepVisibilitySummaryProps {
  emptyMessage?: string;
  inline?: boolean;
  step: ApprovalStep;
}

const visibilitySummarySx: SxProps<Theme> = {
  alignItems: "center",
  color: "text.secondary",
  display: "flex",
  flex: "1 1 auto",
  maxWidth: "100%",
  minWidth: 0,
};

const hiddenApproverListSx: SxProps<Theme> = {
  display: "inline",
};

const visibilityTextSx: SxProps<Theme> = {
  minWidth: 0,
  overflowWrap: "anywhere",
};

const visibilityIconSx: SxProps<Theme> = {
  pointerEvents: "none",
};

const getHiddenApproverLabels = (step: ApprovalStep) => {
  return (step.visibility ?? [])
    .filter((visibility) => visibility.isVisible === false)
    .map((visibility) =>
      visibility.approverDisplayName ??
      visibility.approverEmail ??
      "Approver",
    )
    .filter((label): label is string => Boolean(label));
};

const ApprovalStepVisibilitySummary: React.FC<ApprovalStepVisibilitySummaryProps> = ({
  emptyMessage,
  inline = false,
  step,
}) => {
  const hiddenApproverLabels = getHiddenApproverLabels(step);

  if (hiddenApproverLabels.length === 0 && !emptyMessage) {
    return null;
  }

  const icon = (
    <IconButton
      aria-hidden
      component="span"
      size="small"
      sx={visibilityIconSx}
      tabIndex={-1}
    >
      <VisibilityOff color={Icons.secondaryColor} fontSize="small" sx={Icons.svgNoShrinkStyle} />
    </IconButton>
  );
  const text = (
    <Typography variant="caption" color="text.secondary" sx={visibilityTextSx}>
      {hiddenApproverLabels.length === 0 ? emptyMessage : "Hidden from "}
      {hiddenApproverLabels.length > 0 && (
        <Box component="span" sx={hiddenApproverListSx}>
          {hiddenApproverLabels.join(", ")}
        </Box>
      )}
    </Typography>
  );

  if (inline) {
    return (
      <>
        {icon}
        {text}
      </>
    );
  }

  return (
    <Box sx={visibilitySummarySx}>
      {icon}
      {text}
    </Box>
  );
};

export default ApprovalStepVisibilitySummary;
