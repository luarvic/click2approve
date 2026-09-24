import type { ApprovalStep, AssigneeType } from "@/features/approvalWorkflow/models/approvalStep";
import DiscussionComposer from "@/features/discussions/components/DiscussionComposer";
import DiscussionMessageList from "@/features/discussions/components/DiscussionMessageList";
import { useDiscussionMessages } from "@/features/discussions/hooks/useDiscussionMessages";
import type { UserFile } from "@/features/userFiles/models/userFile";
import { FieldLimits } from "@/shared/config/fieldLimits";
import { useFormValidation } from "@/shared/hooks/useFormValidation";
import { StackSpacing } from "@/shared/theme/tokens";
import { textRule } from "@/shared/utils/formValidation";
import { Stack } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import type { Dispatch, SetStateAction } from "react";
import { forwardRef, useCallback, useEffect, useImperativeHandle } from "react";

interface DiscussionPanelProps {
  attachmentsAreEnabled: boolean;
  body: string;
  canSend: boolean;
  canSendMessage?: () => Promise<boolean>;
  files: UserFile[];
  onBodyChange: (body: string) => void;
  onFilesChange: Dispatch<SetStateAction<UserFile[]>>;
  onSendStateChange?: (isSending: boolean) => void;
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

export { getDiscussionMessageSender } from "@/features/discussions/components/DiscussionMessageList";

const panelSx: SxProps<Theme> = { pt: 2 };

const DiscussionPanel = forwardRef<DiscussionPanelHandle, DiscussionPanelProps>(
  (
    {
      attachmentsAreEnabled,
      body,
      canSend,
      canSendMessage,
      files,
      onBodyChange,
      onFilesChange,
      onSendStateChange,
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
    const {
      isSending,
      messages,
      send: sendMessage,
    } = useDiscussionMessages({
      canSend: canSendMessage,
      requestGlobalId,
      taskGlobalId,
      tenantGlobalId,
    });
    useEffect(() => {
      const frame = window.requestAnimationFrame(() => {
        window.scrollTo({
          behavior: "smooth",
          top: document.documentElement.scrollHeight,
        });
      });
      return () => window.cancelAnimationFrame(frame);
    }, [messages?.length]);
    useEffect(() => {
      onSendStateChange?.(isSending);
    }, [isSending, onSendStateChange]);
    const validation = useFormValidation(
      { body },
      { body: textRule("Message", FieldLimits.text, !attachmentsAreEnabled || files.length === 0) },
    );
    const send = useCallback(async () => {
      if (!validation.validate()) return;
      const sent = await sendMessage(body, attachmentsAreEnabled ? files : []);
      if (sent) {
        onBodyChange("");
        onFilesChange([]);
      }
    }, [attachmentsAreEnabled, body, files, onBodyChange, onFilesChange, sendMessage, validation]);

    useImperativeHandle(
      ref,
      () => ({
        canSend: Boolean(body.trim() || (attachmentsAreEnabled && files.length)),
        send,
      }),
      [attachmentsAreEnabled, body, files.length, send],
    );
    return (
      <Stack spacing={StackSpacing.loose} sx={panelSx}>
        <DiscussionMessageList
          attachmentsAreEnabled={attachmentsAreEnabled}
          messages={messages}
          requesterDisplayName={requesterDisplayName}
          requesterEmail={requesterEmail}
          requesterType={requesterType}
          stepLabels={stepLabels}
          steps={steps}
          taskApprovalRequestStepGlobalId={taskApprovalRequestStepGlobalId}
          taskGlobalId={taskGlobalId}
          tenantGlobalId={tenantGlobalId}
        />
        {canSend && (
          <DiscussionComposer
            error={validation.message("body")}
            attachmentsAreEnabled={attachmentsAreEnabled}
            body={body}
            files={files}
            onBodyChange={onBodyChange}
            onFilesChange={onFilesChange}
            onSend={send}
            tenantGlobalId={tenantGlobalId}
          />
        )}
      </Stack>
    );
  },
);
export default DiscussionPanel;
