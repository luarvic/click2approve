import ApprovalRequestDetailLabel from "@/features/approvalRequests/components/ApprovalRequestDetailLabel";
import ApprovalRequestFilesList from "@/features/approvalRequests/components/ApprovalRequestFilesList";
import { UserFile } from "@/features/userFiles/models/userFile";
import { downloadApprovalRequestTaskAttachment } from "@/features/userFiles/utils/downloaders";
import { StackSpacing } from "@/shared/constants/constants";
import { Stack } from "@mui/material";

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
}) => (
  <Stack alignItems="flex-start" spacing={StackSpacing.default}>
    {showLabel && <ApprovalRequestDetailLabel>{label}</ApprovalRequestDetailLabel>}
    <ApprovalRequestFilesList
      existingFiles={taskFiles.map((file) => ({ file }))}
      newFiles={[]}
      onDownloadExisting={(file) => void downloadApprovalRequestTaskAttachment(tenantGlobalId, file, taskGlobalId)}
      onRemoveNew={() => undefined}
    />
  </Stack>
);

export default ApprovalRequestTaskAttachmentList;
