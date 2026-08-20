import { ApprovalRequest } from "@/features/approvalRequests/models/approvalRequest";
import { ApprovalRequestTask as ApprovalRequestTaskModel } from "@/features/approvalRequests/models/approvalRequestTask";
import { getApprovalRequestStepLabels } from "@/features/approvalRequests/utils/approvalRequestStepLabels";
import ApprovalRequestActionBar from "@/features/approvalRequests/components/ApprovalRequestActionBar";
import MainActionButton from "@/shared/components/buttons/MainActionButton";
import { AssigneeType } from "@/features/approvalWorkflow/models/approvalStep";
import DiscussionPanel, { DiscussionPanelHandle } from "@/features/discussions/components/DiscussionPanel";
import { UserFile } from "@/features/userFiles/models/userFile";
import { useEffect, useRef, useState } from "react";

interface ApprovalRequestDiscussionSectionProps {
  attachmentsAreEnabled: boolean;
  approvalRequest: ApprovalRequest;
  canSend: boolean;
  onClose: () => void;
  task?: ApprovalRequestTaskModel;
  tenantGlobalId: string | null;
}

const ApprovalRequestDiscussionSection: React.FC<ApprovalRequestDiscussionSectionProps> = ({
  attachmentsAreEnabled,
  approvalRequest,
  canSend,
  onClose,
  task,
  tenantGlobalId,
}) => {
  const [body, setBody] = useState("");
  const [files, setFiles] = useState<UserFile[]>([]);
  const [isSending, setIsSending] = useState(false);
  const discussionPanel = useRef<DiscussionPanelHandle>(null);

  useEffect(() => {
    setBody("");
    setFiles([]);
    setIsSending(false);
  }, [approvalRequest.globalId, task?.globalId]);

  return (
    <>
      <DiscussionPanel
        attachmentsAreEnabled={attachmentsAreEnabled}
        body={body}
        canSend={canSend}
        files={files}
        onBodyChange={setBody}
        onFilesChange={setFiles}
        onSendStateChange={setIsSending}
        ref={discussionPanel}
        requestGlobalId={approvalRequest.globalId}
        requesterDisplayName={approvalRequest.createdByDisplayName}
        requesterEmail={approvalRequest.createdByEmail}
        requesterType={approvalRequest.createdByEmployeeGlobalId ? AssigneeType.Employee : AssigneeType.User}
        stepLabels={getApprovalRequestStepLabels(approvalRequest)}
        steps={approvalRequest.steps}
        taskApprovalRequestStepGlobalId={task?.approvalRequestStepGlobalId}
        taskGlobalId={task?.globalId}
        tenantGlobalId={tenantGlobalId}
      />
      <ApprovalRequestActionBar onClose={onClose}>
        {canSend && (
          <MainActionButton loading={isSending} onClick={() => void discussionPanel.current?.send()}>
            Send
          </MainActionButton>
        )}
      </ApprovalRequestActionBar>
    </>
  );
};

export default ApprovalRequestDiscussionSection;
