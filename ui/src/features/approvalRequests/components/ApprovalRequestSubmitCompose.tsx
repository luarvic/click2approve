import ApprovalRequestDetailsCard from "@/features/approvalRequests/components/ApprovalRequestDetailsCard";
import ApprovalRequestFilesList, {
  RevisionExistingFile,
} from "@/features/approvalRequests/components/ApprovalRequestFilesList";
import ApprovalRequestSubmitActions from "@/features/approvalRequests/components/ApprovalRequestSubmitActions";
import { getAssigneeError } from "@/features/approvalRequests/utils/submitValidation";
import ApprovalStepEditor from "@/features/approvalWorkflow/components/ApprovalStepEditor";
import { ApprovalStepAssignee } from "@/features/approvalWorkflow/models/approvalStep";
import { EditableApprovalStep } from "@/features/approvalWorkflow/models/editableApprovalStep";
import { Employee } from "@/features/employees/models/employee";
import { Team } from "@/features/teams/models/team";
import { UserFile } from "@/features/userFiles/models/userFile";
import { Forms } from "@/shared/components/dialogs/formStyles";
import { Files } from "@/shared/components/files/fileInputStyles";
import { Add, AttachFile } from "@mui/icons-material";
import LoadingButton from "@mui/lab/LoadingButton";
import { Box, Button, FormHelperText, Stack, TextField } from "@mui/material";
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
  isSavingTemplate: boolean;
  isSubmitting: boolean;
  newFiles: UserFile[];
  replacementFileInput: RefObject<HTMLInputElement>;
  showAttachmentRequirement: boolean;
  showOrganizationEmployeesVisibility: boolean;
  steps: EditableApprovalStep[];
  teams: Team[];
  title: string;
  titleError?: string;
  filesError?: string;
  stepsError?: string;
  stepErrors?: (string | undefined)[];
  showAssigneeErrors?: boolean;
  onAddAssignee: (stepIndex: number) => void;
  onAddStep: () => void;
  onCancel: () => void;
  onSaveTemplate?: () => void;
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
  isSavingTemplate,
  isSubmitting,
  newFiles,
  replacementFileInput,
  showAttachmentRequirement,
  showOrganizationEmployeesVisibility,
  steps,
  teams,
  title,
  titleError,
  filesError,
  stepsError,
  stepErrors,
  showAssigneeErrors,
  onAddAssignee,
  onAddStep,
  onCancel,
  onSaveTemplate,
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
  <Box component="form" noValidate onSubmit={onSubmit}>
    <Stack spacing={Forms.formStackSpacing} sx={Forms.tabContentSx}>
      <ApprovalRequestDetailsCard ariaLabel="Request details" elevated mode="edit" showStatusBorder={false}>
        <Stack spacing={Forms.formStackSpacing}>
          <TextField
            autoFocus
            disabled={isRevision}
            fullWidth
            label="Title"
            error={Boolean(titleError)}
            helperText={titleError}
            margin="normal"
            required
            value={title}
            onChange={(event) => onTitleChange(event.target.value)}
          />
          <ApprovalRequestFilesList
            existingFiles={existingFiles}
            isActionsDisabled={isFilesBusy}
            linkVariant="body1"
            newFiles={newFiles}
            onRemoveExisting={onRemoveExisting}
            onRemoveNew={onRemoveNew}
            onRemoveReplacement={onRemoveReplacement}
            onReplaceExisting={isRevision ? onReplaceExisting : undefined}
            onRestoreExisting={onRestoreExisting}
          />
          <Box sx={Forms.bottomSpacingSx}>
            <FormHelperText
              error={Boolean(filesError)}
              role={filesError ? "alert" : undefined}
              tabIndex={-1}
              data-validation-error={filesError ? true : undefined}
            >
              {filesError ?? "Attach at least one file for approval."}
            </FormHelperText>
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
      <Stack spacing={Forms.formStackSpacing}>
        {stepsError && (
          <FormHelperText error role="alert" tabIndex={-1} data-validation-error>
            {stepsError}
          </FormHelperText>
        )}
        <ApprovalStepEditor
          stepErrors={stepErrors}
          getAssigneeError={showAssigneeErrors ? getAssigneeError : undefined}
          canUseEmployees={canUseEmployees}
          canUseTeams={canUseTeams}
          employees={employees}
          showAddStep={false}
          showAttachmentRequirement={showAttachmentRequirement}
          showOrganizationEmployeesVisibility={showOrganizationEmployeesVisibility}
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
        <Box sx={Forms.textBottomSpacingSx}>
          <Button startIcon={<Add />} onClick={onAddStep}>
            Add step
          </Button>
        </Box>
      </Stack>
    </Stack>
    <ApprovalRequestSubmitActions
      isSavingTemplate={isSavingTemplate}
      isSubmitting={isSubmitting}
      onCancel={onCancel}
      onSaveTemplate={onSaveTemplate}
    />
  </Box>
);

export default ApprovalRequestSubmitCompose;
