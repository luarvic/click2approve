import type { ApprovalStep } from "@/features/approvalWorkflow/models/approvalStep";
import {
  DiscussionMessage,
  listRequestDiscussion,
  listTaskDiscussion,
  sendRequestDiscussion,
  sendTaskDiscussion,
} from "@/features/discussions/api/discussionsApi";
import DiscussionParticipants from "@/features/discussions/components/DiscussionParticipants";
import { Refresh } from "@/shared/constants/constants";
import { Box, Divider, Stack, TextField, Typography } from "@mui/material";
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

const DiscussionPanel = forwardRef<DiscussionPanelHandle, DiscussionPanelProps>(
  (
    {
      canSend,
      requestGlobalId,
      requesterDisplayName,
      requesterEmail,
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
      window.dispatchEvent(
        new Event("click2approve:discussion-unread-items-changed"),
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
      const sendingUser = message.sentByDisplayName.trim() || "Unknown user";
      const sender = message.isDelegated
        ? sendingUser
        : (representedSender ?? sendingUser);
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
          <Stack spacing={0.25}>
            <Stack spacing={0}>
              <Typography color="inherit" fontWeight={600} variant="subtitle2">
                {sender}
              </Typography>
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
            <Typography color="inherit" sx={{ py: 0.5 }}>
              {message.body}
            </Typography>
            <Typography
              color={isOutgoing ? "inherit" : "text.secondary"}
              sx={{ opacity: isOutgoing ? 0.8 : 1 }}
              variant="caption"
            >
              {new Date(message.createdAt).toLocaleString()}
            </Typography>
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
