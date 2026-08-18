import ApprovalRequestDetailsCard from "@/features/approvalRequests/components/ApprovalRequestDetailsCard";
import ApprovalRequestFilesList, {
  RevisionExistingFile,
} from "@/features/approvalRequests/components/ApprovalRequestFilesList";
import ApprovalRequestSubmitActions from "@/features/approvalRequests/components/ApprovalRequestSubmitActions";
import { EditableApprovalStep } from "@/features/approvalWorkflow/models/editableApprovalStep";
import ApprovalStepEditor from "@/features/approvalWorkflow/components/ApprovalStepEditor";
import { ApprovalStepAssignee } from "@/features/approvalWorkflow/models/approvalStep";
import { Employee } from "@/features/employees/models/employee";
import { Team } from "@/features/teams/models/team";
import { UserFile } from "@/features/userFiles/models/userFile";
import { Dialogs, Files } from "@/shared/constants/constants";
import { Add, AttachFile } from "@mui/icons-material";
import LoadingButton from "@mui/lab/LoadingButton";
import { Box, Button, Stack, TextField } from "@mui/material";
import type { ChangeEventHandler, FormEventHandler, RefObject } from "react";

interface ApprovalRequestSubmitComposeProps {
  canUseEmployees: boolean;
  canUseTeams: boolean;
  description: string;
  employees: Employee[];
  existingFiles: RevisionExistingFile[];
  fileInput: RefObject<HTMLInputElement>;
  isFilesBusy: boolean;
  isFilesUploading: boolean;
  isRevision: boolean;
  isSubmitting: boolean;
  newFiles: UserFile[];
  replacementFileInput: RefObject<HTMLInputElement>;
  showAttachmentRequirement: boolean;
  steps: EditableApprovalStep[];
  teams: Team[];
  title: string;
  onAddAssignee: (stepIndex: number) => void;
  onAddStep: () => void;
  onCancel: () => void;
  onDescriptionChange: (description: string) => void;
  onFilesChange: ChangeEventHandler<HTMLInputElement>;
  onMoveStep: (stepIndex: number, direction: -1 | 1) => void;
  onRemoveAssignee: (stepIndex: number, assigneeIndex: number) => void;
  onRemoveExisting: (index: number) => void;
  onRemoveNew: (index: number) => void;
  onRemoveReplacement: (index: number) => void;
  onRemoveStep: (stepIndex: number) => void;
  onReplaceExisting: (index: number) => void;
  onReplacementFilesChange: ChangeEventHandler<HTMLInputElement>;
  onRestoreExisting: (index: number) => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onTitleChange: (title: string) => void;
  onUpdateAssignee: (stepIndex: number, assigneeIndex: number, assignee: ApprovalStepAssignee) => void;
  onUpdateStep: (stepIndex: number, updater: (step: EditableApprovalStep) => EditableApprovalStep) => void;
  onUploadClick: () => void;
}

const ApprovalRequestSubmitCompose: React.FC<ApprovalRequestSubmitComposeProps> = ({
  canUseEmployees,
  canUseTeams,
  description,
  employees,
  existingFiles,
  fileInput,
  isFilesBusy,
  isFilesUploading,
  isRevision,
  isSubmitting,
  newFiles,
  replacementFileInput,
  showAttachmentRequirement,
  steps,
  teams,
  title,
  onAddAssignee,
  onAddStep,
  onCancel,
  onDescriptionChange,
  onFilesChange,
  onMoveStep,
  onRemoveAssignee,
  onRemoveExisting,
  onRemoveNew,
  onRemoveReplacement,
  onRemoveStep,
  onReplaceExisting,
  onReplacementFilesChange,
  onRestoreExisting,
  onSubmit,
  onTitleChange,
  onUpdateAssignee,
  onUpdateStep,
  onUploadClick,
}) => (
  <Box component="form" onSubmit={onSubmit}>
    <Stack spacing={Dialogs.formStackSpacing} sx={Dialogs.tabContentSx}>
      <ApprovalRequestDetailsCard ariaLabel="Request details" mode="edit" showStatusBorder={false}>
        <Stack spacing={Dialogs.formStackSpacing}>
          <TextField
            autoFocus
            disabled={isRevision}
            fullWidth
            label="Title"
            margin="normal"
            required
            value={title}
            onChange={(event) => onTitleChange(event.target.value)}
          />
          <ApprovalRequestFilesList
            existingFiles={existingFiles}
            isActionsDisabled={isFilesBusy}
            newFiles={newFiles}
            onRemoveExisting={onRemoveExisting}
            onRemoveNew={onRemoveNew}
            onRemoveReplacement={onRemoveReplacement}
            onReplaceExisting={isRevision ? onReplaceExisting : undefined}
            onRestoreExisting={onRestoreExisting}
          />
          <Box sx={Dialogs.bottomSpacingSx}>
            <LoadingButton
              disabled={isFilesBusy}
              loading={isFilesUploading}
              startIcon={<AttachFile />}
              onClick={onUploadClick}
            >
              Attach files
            </LoadingButton>
            <input
              multiple
              name="approval-request-files"
              ref={fileInput}
              style={Files.inputStyle}
              type="file"
              onChange={onFilesChange}
            />
            <input
              name="approval-request-replacement-file"
              ref={replacementFileInput}
              style={Files.inputStyle}
              type="file"
              onChange={onReplacementFilesChange}
            />
          </Box>
          <TextField
            fullWidth
            label="Description"
            margin="normal"
            multiline
            value={description}
            onChange={(event) => onDescriptionChange(event.target.value)}
          />
        </Stack>
      </ApprovalRequestDetailsCard>
      <Stack spacing={Dialogs.formStackSpacing}>
        <ApprovalStepEditor
          canUseEmployees={canUseEmployees}
          canUseTeams={canUseTeams}
          compactEmployeeOptions
          employees={employees}
          showAddStep={false}
          showAttachmentRequirement={showAttachmentRequirement}
          stackAssigneeControlsOnSmallScreens
          steps={steps}
          teams={teams}
          onAddAssignee={onAddAssignee}
          onAddStep={onAddStep}
          onMoveStep={onMoveStep}
          onRemoveAssignee={onRemoveAssignee}
          onRemoveStep={onRemoveStep}
          onUpdateAssignee={onUpdateAssignee}
          onUpdateStep={onUpdateStep}
        />
        <Box sx={Dialogs.textBottomSpacingSx}>
          <Button startIcon={<Add />} onClick={onAddStep}>
            Add step
          </Button>
        </Box>
      </Stack>
    </Stack>
    <ApprovalRequestSubmitActions canContinue={steps.length >= 2} isSubmitting={isSubmitting} onCancel={onCancel} />
  </Box>
);

export default ApprovalRequestSubmitCompose;
