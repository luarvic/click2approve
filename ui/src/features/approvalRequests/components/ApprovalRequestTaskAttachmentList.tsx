import ApprovalRequestField from "@/features/approvalRequests/components/ApprovalRequestField";
import ApprovalRequestFilesList from "@/features/approvalRequests/components/ApprovalRequestFilesList";
import { UserFile } from "@/features/userFiles/models/userFile";
import { downloadApprovalRequestTaskAttachment } from "@/features/userFiles/utils/downloaders";

interface ApprovalRequestTaskAttachmentListProps {
  label?: string;
  showLabel?: boolean;
  taskFiles: UserFile[];
  taskGlobalId: string;
  tenantGlobalId: string;
}

const ApprovalRequestTaskAttachmentList: React.FC<ApprovalRequestTaskAttachmentListProps> = ({
  label = "Files to attach",
  showLabel = true,
  taskFiles,
  taskGlobalId,
  tenantGlobalId,
}) => {
  const files = (
    <ApprovalRequestFilesList
      existingFiles={taskFiles.map((file) => ({ file }))}
      linkVariant="body1"
      newFiles={[]}
      onDownloadExisting={(file) => void downloadApprovalRequestTaskAttachment(tenantGlobalId, file, taskGlobalId)}
      onRemoveNew={() => undefined}
    />
  );

  return showLabel ? <ApprovalRequestField label={label} value={files} /> : files;
};

export default ApprovalRequestTaskAttachmentList;
