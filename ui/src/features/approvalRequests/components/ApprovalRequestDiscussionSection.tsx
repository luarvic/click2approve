import { ApprovalRequest } from "@/features/approvalRequests/models/approvalRequest";
import { ApprovalRequestTask as ApprovalRequestTaskModel } from "@/features/approvalRequests/models/approvalRequestTask";
import { getApprovalRequestStepLabels } from "@/features/approvalRequests/utils/approvalRequestStepLabels";
import ApprovalRequestActionBar from "@/features/approvalRequests/components/ApprovalRequestActionBar";
import { AssigneeType } from "@/features/approvalWorkflow/models/approvalStep";
import DiscussionPanel, { DiscussionPanelHandle } from "@/features/discussions/components/DiscussionPanel";
import { UserFile } from "@/features/userFiles/models/userFile";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
import LoadingButton from "@mui/lab/LoadingButton";
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
  const discussionPanel = useRef<DiscussionPanelHandle>(null);
  const sendAction = useAsyncAction(
    task
      ? ActionLoaders.discussions.sendForTask(task.globalId)
      : ActionLoaders.discussions.sendForRequest(approvalRequest.globalId),
  );

  useEffect(() => {
    setBody("");
    setFiles([]);
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
          <LoadingButton
            loading={sendAction.isRunning}
            variant="outlined"
            onClick={() => void sendAction.run(async () => discussionPanel.current?.send())}
          >
            Send
          </LoadingButton>
        )}
      </ApprovalRequestActionBar>
    </>
  );
};

export default ApprovalRequestDiscussionSection;
