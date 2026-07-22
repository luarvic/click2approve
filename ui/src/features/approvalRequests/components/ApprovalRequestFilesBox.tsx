import { stores } from "@/app/rootStore";
import UserFilesList from "@/features/userFiles/components/UserFilesList";
import { UserFile } from "@/features/userFiles/models/userFile";
import {
  downloadApprovalRequestFile,
  downloadApprovalRequestTaskFile,
} from "@/features/userFiles/utils/downloaders";
import CommentPaper from "@/shared/components/papers/CommentPaper";

interface ApprovalRequestFilesBoxProps {
  userFiles?: UserFile[];
  approvalRequestId?: number;
  approvalRequestTaskId?: number;
}

const ApprovalRequestFilesBox: React.FC<ApprovalRequestFilesBoxProps> = ({
  userFiles,
  approvalRequestId,
  approvalRequestTaskId,
}) => {
  const tenantId = stores.tenantStore.currentTenantId;
  const onDownload = tenantId && approvalRequestTaskId
    ? (userFile: UserFile) =>
      downloadApprovalRequestTaskFile(tenantId, userFile, approvalRequestTaskId)
    : tenantId && approvalRequestId
      ? (userFile: UserFile) =>
        downloadApprovalRequestFile(tenantId, userFile, approvalRequestId)
      : undefined;

  return (
    <CommentPaper>
      <UserFilesList
        userFiles={userFiles}
        direction="column"
        onDownload={onDownload}
      />
    </CommentPaper>
  );
};

export default ApprovalRequestFilesBox;
