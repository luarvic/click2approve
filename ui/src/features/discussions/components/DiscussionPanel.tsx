import type {
  ApprovalStep,
  AssigneeType,
} from "@/features/approvalWorkflow/models/approvalStep";
import ApprovalRequestParticipantLine from "@/features/approvalRequests/components/ApprovalRequestParticipantLine";
import {
  DiscussionMessage,
  listRequestDiscussion,
  listTaskDiscussion,
  sendRequestDiscussion,
  sendTaskDiscussion,
} from "@/features/discussions/api/discussionsApi";
import DiscussionParticipants from "@/features/discussions/components/DiscussionParticipants";
import DisplayName from "@/shared/components/identity/DisplayName";
import UserProvidedText from "@/shared/components/text/UserProvidedText";
import TimelineTimestamp from "@/shared/components/timeline/TimelineTimestamp";
import { Refresh, StackSpacing } from "@/shared/constants/constants";
import type { SxProps } from "@mui/material";
import { Box, Divider, Stack, TextField, Typography } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import {
  Fragment,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";

interface DiscussionPanelProps {
  canSend: boolean;
  requestGlobalId: string;
  requesterDisplayName: string;
  requesterEmail: string;
  requesterType: AssigneeType;
  stepLabels: Record<string, string>;
  steps: ApprovalStep[];
  taskApprovalRequestStepGlobalId?: string;
  taskGlobalId?: string;
  tenantGlobalId: string | null;
}

export interface DiscussionPanelHandle {
  send: () => Promise<void>;
  canSend: boolean;
}

export const getDiscussionMessageSender = (
  message: DiscussionMessage,
) => {
  const representedSender =
    message.sentOnBehalfOfDisplayName?.trim() || undefined;
  const sendingUser = message.sentByDisplayName.trim() || "Unknown user";
  return message.isDelegated
    ? sendingUser
    : (representedSender ?? sendingUser);
};

const getMessageTimelineSx = (isOutgoing: boolean): SxProps<Theme> => ({
  opacity: isOutgoing ? 0.8 : 1,
});

const getMessageSenderSx = (isOutgoing: boolean): SxProps<Theme> => ({
  "& .MuiSvgIcon-root": {
    color: isOutgoing ? "inherit" : undefined,
  },
});

const DiscussionPanel = forwardRef<DiscussionPanelHandle, DiscussionPanelProps>(
  (
    {
      canSend,
      requestGlobalId,
      requesterDisplayName,
      requesterEmail,
      requesterType,
      stepLabels,
      steps,
      taskApprovalRequestStepGlobalId,
      taskGlobalId,
      tenantGlobalId,
    },
    ref,
  ) => {
    const [messages, setMessages] = useState<DiscussionMessage[] | null>(null);
    const [body, setBody] = useState("");
    const load = useCallback(async () => {
      if (!tenantGlobalId) return;
      setMessages(
        taskGlobalId
          ? await listTaskDiscussion(tenantGlobalId, taskGlobalId)
          : await listRequestDiscussion(tenantGlobalId, requestGlobalId),
      );
    }, [requestGlobalId, taskGlobalId, tenantGlobalId]);

    useEffect(() => {
      void load();
      if (Refresh.discussionsMs <= 0) return;
      const id = window.setInterval(() => void load(), Refresh.discussionsMs);
      return () => window.clearInterval(id);
    }, [load]);
    useEffect(() => {
      const frame = window.requestAnimationFrame(() => {
        window.scrollTo({
          behavior: "smooth",
          top: document.documentElement.scrollHeight,
        });
      });
      return () => window.cancelAnimationFrame(frame);
    }, [messages?.length]);
    const send = useCallback(async () => {
      if (!tenantGlobalId || !body.trim()) return;
      const message = taskGlobalId
        ? await sendTaskDiscussion(tenantGlobalId, taskGlobalId, body)
        : await sendRequestDiscussion(tenantGlobalId, requestGlobalId, body);
      setMessages((current) => [...(current ?? []), message]);
      setBody("");
    }, [body, requestGlobalId, taskGlobalId, tenantGlobalId]);

    useImperativeHandle(ref, () => ({ canSend: Boolean(body.trim()), send }), [
      body,
      send,
    ]);
    const taskStep = taskApprovalRequestStepGlobalId
      ? steps.find((step) => step.globalId === taskApprovalRequestStepGlobalId)
      : undefined;
    const discussionSteps = steps.filter(
      (step) => (step.tasks?.length ?? 0) > 0,
    );
    const renderMessage = (message: DiscussionMessage) => {
      const isOutgoing = message.isOutgoing === true;
      const representedSender =
        message.sentOnBehalfOfDisplayName?.trim() || undefined;
      const sender = getDiscussionMessageSender(message);
      return (
        <Box
          key={message.globalId}
          sx={{
            alignSelf: isOutgoing ? "flex-end" : "flex-start",
            backgroundColor: isOutgoing ? "primary.main" : "action.selected",
            borderRadius: 2,
            color: isOutgoing ? "primary.contrastText" : "text.primary",
            maxWidth: "80%",
            px: 1.5,
            py: 1,
          }}
        >
          <Stack spacing={StackSpacing.default}>
            <Stack spacing={StackSpacing.tight}>
              <ApprovalRequestParticipantLine
                label={(
                  <DisplayName
                    displayName={sender}
                    showEmailAddress={false}
                  />
                )}
                sx={getMessageSenderSx(isOutgoing)}
                type={message.sentByType}
              />
              {message.isDelegated && representedSender && (
                <Typography
                  color="inherit"
                  sx={{ mt: -0.25, opacity: 0.8 }}
                  variant="caption"
                >
                  On behalf of {representedSender}
                </Typography>
              )}
            </Stack>
            <UserProvidedText
              color="inherit"
              text={message.body}
            />
            <TimelineTimestamp
              color={isOutgoing ? "inherit" : "text.secondary"}
              date={new Date(message.createdAt)}
              sx={getMessageTimelineSx(isOutgoing)}
            />
          </Stack>
        </Box>
      );
    };
    return (
      <Stack spacing={2} sx={{ pt: 2 }}>
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
                  {step.globalId
                    ? (stepLabels[step.globalId] ?? "Step")
                    : "Step"}
                </Typography>
              </Divider>
              <DiscussionParticipants
                assignees={step.assignees}
                requesterDisplayName={requesterDisplayName}
                requesterEmail={requesterEmail}
                requesterType={requesterType}
              />
              {(messages ?? [])
                .filter(
                  (message) =>
                    message.approvalRequestStepGlobalId === step.globalId,
                )
                .map(renderMessage)}
            </Fragment>
          ))}
        {taskGlobalId && (messages ?? []).map(renderMessage)}
        {canSend && (
          <TextField
            fullWidth
            label="Message"
            multiline
            value={body}
            onChange={(event) => setBody(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void send();
              }
            }}
          />
        )}
      </Stack>
    );
  },
);
export default DiscussionPanel;
