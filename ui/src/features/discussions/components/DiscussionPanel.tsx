import type { ApprovalStep, AssigneeType } from "@/features/approvalWorkflow/models/approvalStep";
import ApprovalRequestFilesList from "@/features/approvalRequests/components/ApprovalRequestFilesList";
import ApprovalRequestParticipantLine from "@/features/approvalRequests/components/ApprovalRequestParticipantLine";
import { getApprovalRequestTaskActionLabels } from "@/features/approvalRequests/utils/approvalRequestTaskActionLabels";
import {
  DiscussionMessage,
  listRequestDiscussion,
  listTaskDiscussion,
  sendRequestDiscussion,
  sendTaskDiscussion,
} from "@/features/discussions/api/discussionsApi";
import DiscussionParticipants from "@/features/discussions/components/DiscussionParticipants";
import { uploadUserFiles } from "@/features/userFiles/api/userFilesApi";
import { downloadDiscussionMessageFile } from "@/features/userFiles/utils/downloaders";
import DisplayName from "@/shared/components/identity/DisplayName";
import UserProvidedText from "@/shared/components/text/UserProvidedText";
import TimelineTimestamp from "@/shared/components/timeline/TimelineTimestamp";
import { Files, Refresh, StackSpacing } from "@/shared/constants/constants";
import { AttachFile } from "@mui/icons-material";
import { Box, Button, Divider, Stack, TextField, Typography } from "@mui/material";
import { alpha, type SxProps, type Theme } from "@mui/material/styles";
import { Fragment, forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";

interface DiscussionPanelProps {
  attachmentsAreEnabled: boolean;
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

export const getDiscussionMessageSender = (message: DiscussionMessage) => {
  const representedSender = message.sentOnBehalfOfDisplayName?.trim() || undefined;
  const sendingUser = message.sentByDisplayName.trim() || "Unknown user";
  return message.isDelegated ? sendingUser : (representedSender ?? sendingUser);
};

const getMessageBubbleSx = (isOutgoing: boolean): SxProps<Theme> => ({
  alignSelf: isOutgoing ? "flex-end" : "flex-start",
  backgroundColor: (theme) => (isOutgoing ? alpha(theme.palette.primary.main, 0.1) : theme.palette.action.selected),
  borderRadius: 2,
  color: "text.primary",
  maxWidth: "80%",
  px: 1.5,
  py: 1,
});

const DiscussionPanel = forwardRef<DiscussionPanelHandle, DiscussionPanelProps>(
  (
    {
      attachmentsAreEnabled,
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
    const [files, setFiles] = useState<File[]>([]);
    const fileInput = useRef<HTMLInputElement>(null);
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
      if (!tenantGlobalId || (!body.trim() && (!attachmentsAreEnabled || files.length === 0))) return;
      const uploadedFiles = attachmentsAreEnabled ? await uploadUserFiles(tenantGlobalId, files) : [];
      if (uploadedFiles.length !== files.length) return;
      const message = taskGlobalId
        ? await sendTaskDiscussion(
            tenantGlobalId,
            taskGlobalId,
            body,
            uploadedFiles.map((file) => file.globalId),
          )
        : await sendRequestDiscussion(
            tenantGlobalId,
            requestGlobalId,
            body,
            uploadedFiles.map((file) => file.globalId),
          );
      setMessages((current) => [...(current ?? []), message]);
      setBody("");
      setFiles([]);
    }, [attachmentsAreEnabled, body, files, requestGlobalId, taskGlobalId, tenantGlobalId]);

    useImperativeHandle(
      ref,
      () => ({
        canSend: Boolean(body.trim() || (attachmentsAreEnabled && files.length)),
        send,
      }),
      [attachmentsAreEnabled, body, files.length, send],
    );
    const taskStep = taskApprovalRequestStepGlobalId
      ? steps.find((step) => step.globalId === taskApprovalRequestStepGlobalId)
      : undefined;
    const discussionSteps = steps.filter((step) => (step.tasks?.length ?? 0) > 0);
    const renderMessage = (message: DiscussionMessage) => {
      const isOutgoing = message.isOutgoing === true;
      const representedSender = message.sentOnBehalfOfDisplayName?.trim() || undefined;
      const sender = getDiscussionMessageSender(message);
      return (
        <Box key={message.globalId} sx={getMessageBubbleSx(isOutgoing)}>
          <Stack spacing={StackSpacing.default}>
            <Stack spacing={StackSpacing.tight}>
              <ApprovalRequestParticipantLine
                label={<DisplayName displayName={sender} showEmailAddress={false} />}
                type={message.sentByType}
              />
              {message.isDelegated && representedSender && (
                <Typography color="inherit" sx={{ mt: -0.25, opacity: 0.8 }} variant="caption">
                  On behalf of {representedSender}
                </Typography>
              )}
            </Stack>
            <UserProvidedText text={message.body} />
            {attachmentsAreEnabled && (message.userFiles?.length ?? 0) > 0 && tenantGlobalId && (
              <ApprovalRequestFilesList
                existingFiles={(message.userFiles ?? []).map((file) => ({
                  file,
                }))}
                newFiles={[]}
                onDownloadExisting={(file) =>
                  void downloadDiscussionMessageFile(tenantGlobalId, file, message.globalId)
                }
                onRemoveNew={() => undefined}
              />
            )}
            <TimelineTimestamp color="text.secondary" date={new Date(message.createdAt)} />
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
                  {`${
                    step.globalId ? (stepLabels[step.globalId] ?? "Step") : "Step"
                  } · ${getApprovalRequestTaskActionLabels(step.action).positive}`}
                </Typography>
              </Divider>
              <DiscussionParticipants
                assignees={step.assignees}
                requesterDisplayName={requesterDisplayName}
                requesterEmail={requesterEmail}
                requesterType={requesterType}
              />
              {(messages ?? [])
                .filter((message) => message.approvalRequestStepGlobalId === step.globalId)
                .map(renderMessage)}
            </Fragment>
          ))}
        {taskGlobalId && (messages ?? []).map(renderMessage)}
        {canSend && (
          <Stack alignItems="flex-start" spacing={StackSpacing.tight}>
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
            {attachmentsAreEnabled && (
              <ApprovalRequestFilesList
                existingFiles={[]}
                newFiles={files}
                onRemoveNew={(index) => setFiles((files) => files.filter((_, fileIndex) => fileIndex !== index))}
              />
            )}
            {attachmentsAreEnabled && (
              <>
                <Button startIcon={<AttachFile />} onClick={() => fileInput.current?.click()}>
                  Attach files
                </Button>
                <input
                  multiple
                  ref={fileInput}
                  style={Files.inputStyle}
                  type="file"
                  onChange={(event) => {
                    setFiles((files) => [...files, ...Array.from(event.target.files ?? [])]);
                    event.target.value = "";
                  }}
                />
              </>
            )}
          </Stack>
        )}
      </Stack>
    );
  },
);
export default DiscussionPanel;
