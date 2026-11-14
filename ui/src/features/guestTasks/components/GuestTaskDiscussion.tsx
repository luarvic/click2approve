import ApprovalRequestActionBar from "@/features/approvalRequests/components/ApprovalRequestActionBar";
import ApprovalRequestFilesList from "@/features/approvalRequests/components/ApprovalRequestFilesList";
import type { ApprovalRequestTask } from "@/features/approvalRequests/models/approvalRequestTask";
import { getApprovalRequestStepLabels } from "@/features/approvalRequests/utils/approvalRequestStepLabels";
import { AssigneeType } from "@/features/approvalWorkflow/models/approvalStep";
import DiscussionMessageList from "@/features/discussions/components/DiscussionMessageList";
import DiscussionComposerField from "@/features/discussions/components/DiscussionComposerField";
import { stores } from "@/app/rootStore";
import { Forms } from "@/shared/components/dialogs/formStyles";
import { StackSpacing } from "@/shared/theme/tokens";
import { Files } from "@/shared/components/files/fileInputStyles";
import { FieldLimits } from "@/shared/config/fieldLimits";
import { useFormValidation } from "@/shared/hooks/useFormValidation";
import { textRule } from "@/shared/utils/formValidation";
import { DiscussionMessage } from "@/features/discussions/models/discussionMessage";
import { GuestTaskApi } from "@/features/guestTasks/api/guestTasksApi";
import { downloadFile } from "@/features/userFiles/utils/downloaders";
import MainActionButton from "@/shared/components/buttons/MainActionButton";
import { Refresh } from "@/shared/config/application";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { notification } from "@/shared/utils/notifications";
import { showPersistenceSuccessNotification } from "@/shared/utils/persistenceNotifications";
import { Stack } from "@mui/material";
import { useEffect, useRef, useState } from "react";

interface GuestTaskDiscussionProps {
  api: GuestTaskApi;
  task: ApprovalRequestTask;
  onClose: () => void;
  onFailure: (error: unknown) => void;
}

const GuestTaskDiscussion = ({ api, task, onFailure, onClose }: GuestTaskDiscussionProps) => {
  const [messages, setMessages] = useState<DiscussionMessage[]>([]);
  const [body, setBody] = useState("");
  const [uploads, setUploads] = useState<File[]>([]);
  const input = useRef<HTMLInputElement>(null);
  const attachmentsAreEnabled = stores.applicationConfigurationStore.discussionAttachmentsAreEnabled;
  const validation = useFormValidation(
    { body },
    { body: textRule("Message", FieldLimits.text, !attachmentsAreEnabled || uploads.length === 0) },
  );
  const action = useAsyncAction("guestTasks.discussion");
  useEffect(() => {
    let active = true;
    const load = () =>
      void api
        .request<DiscussionMessage[]>("GET", "/discussion")
        .then((items) => {
          if (active) setMessages(items);
        })
        .catch((error) => {
          if (active) onFailure(error);
        });
    load();
    const timer = Refresh.discussionsMs > 0 ? window.setInterval(load, Refresh.discussionsMs) : undefined;
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [api, onFailure]);

  const send = async () => {
    if (!validation.validate()) {
      notification.validationWarning();
      return;
    }
    await action.run(async () => {
      try {
        const data = new FormData();
        data.append("body", body);
        (attachmentsAreEnabled ? uploads : []).forEach((file) => data.append("uploads", file));
        const message = await api.request<DiscussionMessage>("POST", "/discussion", data);
        setMessages((current) => [...current, message]);
        setBody("");
        setUploads([]);
        showPersistenceSuccessNotification("Message sent.");
      } catch (error) {
        onFailure(error);
      }
    });
  };

  const request = task.approvalRequest;
  return (
    <>
      <Stack spacing={StackSpacing.loose} sx={Forms.tabContentSx}>
        <DiscussionMessageList
          attachmentsAreEnabled={attachmentsAreEnabled}
          messages={messages}
          requesterDisplayName={task.requestedByDisplayName ?? ""}
          requesterEmail={task.requestedByEmail ?? ""}
          requesterType={request?.requesterEmployeeGlobalId ? AssigneeType.Employee : AssigneeType.User}
          stepLabels={request ? getApprovalRequestStepLabels(request) : {}}
          steps={request?.steps ?? []}
          taskApprovalRequestStepGlobalId={task.approvalRequestStepGlobalId}
          taskGlobalId={task.globalId}
          tenantGlobalId={null}
          onDownloadFile={(file, messageGlobalId) =>
            void downloadFile(file, () =>
              api
                .request<string>("GET", `/discussion/${messageGlobalId}/files/${file.globalId}/downloadBase64`)
                .catch((error) => {
                  onFailure(error);
                  return null;
                }),
            )
          }
        />
        <DiscussionComposerField
          attachmentsAreEnabled={attachmentsAreEnabled}
          body={body}
          error={validation.message("body")}
          onBodyChange={setBody}
          disabled={action.isRunning}
          onSend={send}
          onAttachFiles={() => input.current?.click()}
        />
        {attachmentsAreEnabled && (
          <>
            <input
              ref={input}
              style={Files.inputStyle}
              type="file"
              multiple
              onChange={(event) => {
                setUploads((current) => [...current, ...Array.from(event.target.files ?? [])]);
                event.target.value = "";
              }}
            />
            <ApprovalRequestFilesList
              existingFiles={[]}
              newFiles={uploads.map((file, index) => ({
                globalId: String(index),
                name: file.name,
                type: file.type,
                size: file.size,
                createdAt: "",
                createdAtDate: new Date(0),
                checked: false,
              }))}
              isActionsDisabled={action.isRunning}
              onRemoveNew={(index) => setUploads((current) => current.filter((_, i) => i !== index))}
            />
          </>
        )}
      </Stack>
      <ApprovalRequestActionBar closeLabel="Close" onClose={onClose}>
        <MainActionButton onClick={() => void send()} loading={action.isRunning}>
          Send
        </MainActionButton>
      </ApprovalRequestActionBar>
    </>
  );
};

export default GuestTaskDiscussion;
