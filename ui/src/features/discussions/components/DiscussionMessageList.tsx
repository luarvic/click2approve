import ApprovalRequestFilesList from "@/features/approvalRequests/components/ApprovalRequestFilesList";
import ApprovalRequestParticipantLine from "@/features/approvalRequests/components/ApprovalRequestParticipantLine";
import { getApprovalRequestTaskActionLabels } from "@/features/approvalRequests/utils/approvalRequestTaskActionLabels";
import type { ApprovalStep, AssigneeType } from "@/features/approvalWorkflow/models/approvalStep";
import DiscussionParticipants from "@/features/discussions/components/DiscussionParticipants";
import type { DiscussionMessage } from "@/features/discussions/models/discussionMessage";
import { downloadDiscussionMessageFile } from "@/features/userFiles/utils/downloaders";
import UserProvidedText from "@/shared/components/text/UserProvidedText";
import TimelineTimestamp from "@/shared/components/timeline/TimelineTimestamp";
import { StackSpacing, SurfaceTokens } from "@/shared/theme/tokens";
import { parseUtcDateTime } from "@/shared/utils/dateTime";
import { Box, Divider, Stack, Typography } from "@mui/material";
import { alpha, type SxProps, type Theme } from "@mui/material/styles";
import { Fragment } from "react";

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
  backgroundColor: (theme) => (isOutgoing ? alpha(theme.palette.primary.main, 0.1) : theme.palette.action.selected),
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
            <ApprovalRequestParticipantLine displayName={sender} type={message.sentByType} variant="body2" />
            {message.isDelegated && representedSender && (
              <Typography color="inherit" sx={delegatedSenderSx} variant="caption">
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

  return (
    <>
      {taskGlobalId && taskStep && (
        <DiscussionParticipants
          assignees={taskStep.assignees}
          requesterDisplayName={requesterDisplayName}
          requesterEmail={requesterEmail}
          requesterType={requesterType}
        />
      )}
      {!taskGlobalId &&
        discussionSteps.map((step) => (
          <Fragment key={step.globalId ?? step.sequence}>
            <Divider>
              <Typography color="text.secondary" variant="body2">
                {`${step.globalId ? (stepLabels[step.globalId] ?? "Step") : "Step"} · ${
                  getApprovalRequestTaskActionLabels(step.action).positive
                }`}
              </Typography>
            </Divider>
            <DiscussionParticipants
              assignees={step.assignees}
              requesterDisplayName={requesterDisplayName}
              requesterEmail={requesterEmail}
              requesterType={requesterType}
            />
            {messages?.filter((message) => message.approvalRequestStepGlobalId === step.globalId).map(renderMessage)}
          </Fragment>
        ))}
      {taskGlobalId && messages?.map(renderMessage)}
    </>
  );
};

export default DiscussionMessageList;
