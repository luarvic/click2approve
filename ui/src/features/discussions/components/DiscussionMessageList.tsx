import ApprovalRequestFilesList from "@/features/approvalRequests/components/ApprovalRequestFilesList";
import ApprovalRequestParticipant from "@/features/approvalRequests/components/ApprovalRequestParticipant";
import { getApprovalRequestTaskActionLabels } from "@/features/approvalRequests/utils/approvalRequestTaskActionLabels";
import type { ApprovalStep, AssigneeType } from "@/features/approvalWorkflow/models/approvalStep";
import DiscussionParticipants from "@/features/discussions/components/DiscussionParticipants";
import DiscussionThread from "@/features/discussions/components/DiscussionThread";
import type { DiscussionMessage } from "@/features/discussions/models/discussionMessage";
import { downloadDiscussionMessageFile } from "@/features/userFiles/utils/downloaders";
import UserProvidedText from "@/shared/components/text/UserProvidedText";
import TimelineTimestamp from "@/shared/components/timeline/TimelineTimestamp";
import { StackSpacing, SurfaceTokens } from "@/shared/theme/tokens";
import { parseUtcDateTime } from "@/shared/utils/dateTime";
import { Box, Divider, Stack, Typography } from "@mui/material";
import { alpha, type SxProps, type Theme } from "@mui/material/styles";

interface DiscussionMessageListProps {
  attachmentsAreEnabled: boolean;
  messages: DiscussionMessage[] | null;
  requesterDisplayName: string;
  requesterEmail: string;
  requesterType: AssigneeType;
  stepLabels: Record<string, string>;
  steps: ApprovalStep[];
  taskApprovalRequestStepGlobalId?: string;
  taskGlobalId?: string;
  tenantGlobalId: string | null;
}

const messageBubbleSx = (isOutgoing: boolean): SxProps<Theme> => ({
  "@keyframes discussion-message-entrance": {
    from: {
      opacity: 0,
      transform: "translateY(8px)",
    },
    to: {
      opacity: 1,
      transform: "translateY(0)",
    },
  },
  "@media (prefers-reduced-motion: reduce)": {
    animation: "none",
  },
  alignSelf: isOutgoing ? "flex-end" : "flex-start",
  animation: "discussion-message-entrance 220ms cubic-bezier(0.2, 0, 0, 1) both",
  backgroundColor: (theme) =>
    isOutgoing
      ? alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.18 : 0.12)
      : alpha(theme.palette.text.primary, theme.palette.mode === "dark" ? 0.06 : 0.04),
  borderRadius: SurfaceTokens.borderRadius,
  color: "text.primary",
  maxWidth: "80%",
  px: 1.5,
  py: 1,
});

const delegatedSenderSx: SxProps<Theme> = { mt: -0.25, opacity: 0.8 };

export const getDiscussionMessageSender = (message: DiscussionMessage) => {
  const representedSender = message.sentOnBehalfOfDisplayName?.trim() || undefined;
  const sendingUser = message.sentByDisplayName.trim() || "Unknown user";
  return message.isDelegated ? sendingUser : (representedSender ?? sendingUser);
};

const DiscussionMessageList: React.FC<DiscussionMessageListProps> = ({
  attachmentsAreEnabled,
  messages,
  requesterDisplayName,
  requesterEmail,
  requesterType,
  stepLabels,
  steps,
  taskApprovalRequestStepGlobalId,
  taskGlobalId,
  tenantGlobalId,
}) => {
  const taskStep = taskApprovalRequestStepGlobalId
    ? steps.find((step) => step.globalId === taskApprovalRequestStepGlobalId)
    : undefined;
  const discussionSteps = steps.filter((step) => (step.tasks?.length ?? 0) > 0);
  const renderMessage = (message: DiscussionMessage) => {
    const isOutgoing = message.isOutgoing === true;
    const representedSender = message.sentOnBehalfOfDisplayName?.trim() || undefined;
    const sender = getDiscussionMessageSender(message);

    return (
      <Box key={message.globalId} sx={messageBubbleSx(isOutgoing)}>
        <Stack spacing={StackSpacing.default}>
          <Stack spacing={StackSpacing.tight}>
            <ApprovalRequestParticipant displayName={sender} type={message.sentByType} variant="body2" />
            {message.isDelegated && representedSender && (
              <Typography variant="caption" color="inherit" sx={delegatedSenderSx}>
                On behalf of {representedSender}
              </Typography>
            )}
          </Stack>
          <UserProvidedText text={message.body} />
          {attachmentsAreEnabled && (message.userFiles?.length ?? 0) > 0 && tenantGlobalId && (
            <ApprovalRequestFilesList
              existingFiles={(message.userFiles ?? []).map((file) => ({ file }))}
              newFiles={[]}
              onDownloadExisting={(file) => void downloadDiscussionMessageFile(tenantGlobalId, file, message.globalId)}
              onRemoveNew={() => undefined}
            />
          )}
          <TimelineTimestamp color="text.secondary" date={parseUtcDateTime(message.createdAt)} />
        </Stack>
      </Box>
    );
  };

  const visibleSteps = taskGlobalId ? (taskStep ? [taskStep] : []) : discussionSteps;

  return (
    <Stack spacing={StackSpacing.loose} divider={<Divider />}>
      {visibleSteps.map((step) => (
        <DiscussionThread
          key={step.globalId ?? step.sequence}
          title={`${step.globalId ? (stepLabels[step.globalId] ?? "Step") : "Step"} · ${getApprovalRequestTaskActionLabels(step.action).positive}`}
          participants={
            <DiscussionParticipants
              assignees={step.assignees}
              requesterDisplayName={requesterDisplayName}
              requesterEmail={requesterEmail}
              requesterType={requesterType}
            />
          }
        >
          {messages
            ?.filter((message) => taskGlobalId || message.approvalRequestStepGlobalId === step.globalId)
            .map(renderMessage)}
        </DiscussionThread>
      ))}
      {taskGlobalId && !taskStep && messages?.map(renderMessage)}
    </Stack>
  );
};

export default DiscussionMessageList;
