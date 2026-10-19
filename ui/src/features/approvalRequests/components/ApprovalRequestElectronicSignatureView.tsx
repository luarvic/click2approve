import ApprovalRequestField from "@/features/approvalRequests/components/ApprovalRequestField";
import ApprovalRequestSignatureView from "@/features/approvalRequests/components/ApprovalRequestSignatureView";
import { ApprovalRequestTask } from "@/features/approvalRequests/models/approvalRequestTask";
import { Stack } from "@mui/material";

interface ApprovalRequestElectronicSignatureViewProps {
  task: ApprovalRequestTask;
}

const ApprovalRequestElectronicSignatureView: React.FC<ApprovalRequestElectronicSignatureViewProps> = ({ task }) => (
  <Stack component="section" aria-label="Electronic signature">
    <ApprovalRequestField label="Legal name" value={task.assigneeLegalName} />
    {task.assigneeRepresentationDetails && (
      <ApprovalRequestField label="Representation details" value={task.assigneeRepresentationDetails} />
    )}
    <ApprovalRequestField
      label="Electronic signature"
      value={<ApprovalRequestSignatureView signatureJson={task.assigneeSignatureJson} />}
    />
  </Stack>
);

export default ApprovalRequestElectronicSignatureView;
