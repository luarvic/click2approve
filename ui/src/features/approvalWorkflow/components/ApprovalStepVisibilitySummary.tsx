import {
  ApprovalStep,
} from "@/features/approvalWorkflow/models/approvalStep";
import {
  Dialogs,
  Icons,
} from "@/shared/constants/constants";
import { VisibilityOff } from "@mui/icons-material";
import type { SxProps } from "@mui/material";
import {
  Box,
  IconButton,
  Popover,
  Tooltip,
  Typography,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import type {
  MouseEvent,
} from "react";
import {
  useState,
} from "react";

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

const hiddenAssigneeListSx: SxProps<Theme> = {
  display: "inline",
};

const visibilityTextSx: SxProps<Theme> = {
  minWidth: 0,
  overflowWrap: "anywhere",
};

const visibilityIconSx: SxProps<Theme> = {
  pointerEvents: "none",
};

const visibilityPopoverSx: SxProps<Theme> = {
  maxWidth: 240,
  p: Dialogs.stepStackSpacing,
};

const getHiddenAssigneeLabels = (step: ApprovalStep) => {
  return (step.visibility ?? [])
    .filter((visibility) => visibility.isVisible === false)
    .map((visibility) =>
      visibility.assigneeDisplayName ??
      visibility.assigneeEmail ??
      "Assignee",
    )
    .filter((label): label is string => Boolean(label));
};

const ApprovalStepVisibilitySummary: React.FC<ApprovalStepVisibilitySummaryProps> = ({
  emptyMessage,
  inline = false,
  step,
}) => {
  const [popoverAnchor, setPopoverAnchor] = useState<HTMLElement | null>(null);
  const hiddenAssigneeLabels = getHiddenAssigneeLabels(step);

  if (hiddenAssigneeLabels.length === 0 && !emptyMessage) {
    return null;
  }

  const closePopover = () => {
    setPopoverAnchor(null);
  };

  const popoverId = `hidden-step-visibility-popover-${step.globalId}`;
  const openPopover = (event: MouseEvent<HTMLElement>) => {
    setPopoverAnchor(event.currentTarget);
  };

  const showEmptyMessageTooltip = hiddenAssigneeLabels.length === 0 && Boolean(emptyMessage);
  if (showEmptyMessageTooltip) {
    const emptyMessageIcon = (
      <>
        <Tooltip title={emptyMessage} disableTouchListener>
          <IconButton
            aria-label={emptyMessage}
            aria-describedby={popoverAnchor ? popoverId : undefined}
            onClick={openPopover}
            size="small"
          >
            <VisibilityOff color={Icons.secondaryColor} fontSize="small" sx={Icons.svgNoShrinkStyle} />
          </IconButton>
        </Tooltip>
        <Popover
          id={popoverId}
          anchorEl={popoverAnchor}
          anchorOrigin={{
            horizontal: "center",
            vertical: "bottom",
          }}
          onClose={closePopover}
          open={Boolean(popoverAnchor)}
          transformOrigin={{
            horizontal: "center",
            vertical: "top",
          }}
        >
          <Box sx={visibilityPopoverSx}>
            <Typography variant="body2">{emptyMessage}</Typography>
          </Box>
        </Popover>
      </>
    );

    return inline ? emptyMessageIcon : <Box sx={visibilitySummarySx}>{emptyMessageIcon}</Box>;
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
      Hidden from{" "}
      <Box component="span" sx={hiddenAssigneeListSx}>
        {hiddenAssigneeLabels.join(", ")}
      </Box>
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
