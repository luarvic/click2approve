import { stores } from "@/app/rootStore";
import { resubmitApprovalRequest, submitApprovalRequest } from "@/features/approvalRequests/api/approvalRequestsApi";
import { RevisionExistingFile } from "@/features/approvalRequests/components/ApprovalRequestFilesList";
import ApprovalRequestSubmitCompose from "@/features/approvalRequests/components/ApprovalRequestSubmitCompose";
import { useApprovalRequestSubmitFiles } from "@/features/approvalRequests/hooks/useApprovalRequestSubmitFiles";
import {
  ApprovalRequestFileRevisionAction,
  ApprovalRequestFileSubmission,
} from "@/features/approvalRequests/models/approvalRequest";
import { getIncompleteParticipantNameWarning } from "@/features/approvalRequests/utils/incompleteParticipantNameWarning";
import { hasIncompleteBusinessParticipantName } from "@/features/approvalRequests/utils/participantName";
import { useEditableApprovalSteps } from "@/features/approvalWorkflow/hooks/useEditableApprovalSteps";
import { AssigneeType } from "@/features/approvalWorkflow/models/approvalStep";
import {
  EditableApprovalStep,
  createEditableSteps,
  createEmptyStep,
  toApprovalStepSubmissions,
} from "@/features/approvalWorkflow/models/editableApprovalStep";
import { TenantType } from "@/features/tenants/models/tenant";
import { UserFile } from "@/features/userFiles/models/userFile";
import ConfirmationDialog from "@/shared/components/dialogs/ConfirmationDialog";
import CloseOnEscape from "@/shared/components/navigation/CloseOnEscape";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { Routes } from "@/shared/routing/routes";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
import { notification } from "@/shared/utils/notifications";
import {
  PersistenceSuccessMessages,
  showPersistenceSuccessNotification,
} from "@/shared/utils/persistenceNotifications";
import { observer } from "mobx-react-lite";
import { useEffect, useRef, useState } from "react";

interface ApprovalRequestSubmitProps {
  initialDraft?: ApprovalRequestSubmitDraft;
  initialTemplateGlobalId?: string;
  onClose: (currentApprovalRequestGlobalId?: string) => void;
}

export interface ApprovalRequestSubmitDraft {
  description: string;
  existingFiles: RevisionExistingFile[];
  newFiles: UserFile[];
  steps: EditableApprovalStep[];
  title: string;
}

let cachedDraft: ApprovalRequestSubmitDraft | null = null;

export const cacheApprovalRequestSubmitDraft = (draft: ApprovalRequestSubmitDraft) => {
  cachedDraft = draft;
};

export const getCachedApprovalRequestSubmitDraft = () => cachedDraft;

const ApprovalRequestSubmit: React.FC<ApprovalRequestSubmitProps> = ({
  initialDraft,
  initialTemplateGlobalId,
  onClose,
}) => {
  const [title, setTitle] = useState(initialDraft?.title ?? "");
  const [description, setDescription] = useState(initialDraft?.description ?? "");
  const [nameWarningDialogIsOpen, setNameWarningDialogIsOpen] = useState(false);
  const nameWarning = getIncompleteParticipantNameWarning(stores.tenantStore.currentTenant?.type);
  const submitAction = useAsyncAction(ActionLoaders.approvalRequests.submit());
  const saveTemplateAction = useAsyncAction(ActionLoaders.approvalStepTemplates.save(undefined));
  const initialTemplateHasBeenApplied = useRef(false);

  const tenantGlobalId = stores.tenantStore.currentTenantGlobalId;
  const requestsPath = tenantGlobalId ? Routes.tenantPath(tenantGlobalId, "/requests") : "/";
  const businessTenantIsSelected = stores.tenantStore.currentTenant?.type === TenantType.Business;
  const canUseEmployees = businessTenantIsSelected && stores.applicationConfigurationStore.employeeAssigneesAreEnabled;
  const canUseTeams = businessTenantIsSelected && stores.applicationConfigurationStore.teamAssigneesAreEnabled;
  const defaultAssigneeType = canUseEmployees ? AssigneeType.Employee : AssigneeType.User;
  const canUseTemplates =
    businessTenantIsSelected &&
    stores.applicationConfigurationStore.approvalStepTemplatesAreEnabled &&
    tenantGlobalId !== null;
  const requestToClone = stores.approvalRequestStore.requestToClone;
  const isRevision = Boolean(requestToClone && stores.applicationConfigurationStore.approvalRequestRevisionsAreEnabled);
  const { addAssignee, addStep, moveStep, removeAssignee, removeStep, setSteps, steps, updateAssignee, updateStep } =
    useEditableApprovalSteps({
      defaultAssigneeType,
      initialSteps: initialDraft?.steps ?? [createEmptyStep(1, true, defaultAssigneeType)],
    });
  const {
    addedFilesUpload,
    clear: clearFiles,
    existingFiles,
    fileDeletion,
    handleReplacementFilesChange,
    newFiles,
    removeExistingFile,
    removeNewFile,
    removeReplacementFile,
    replacementFilesUpload,
    restoreExistingFile,
    setExistingFiles,
    startReplacingExistingFile,
  } = useApprovalRequestSubmitFiles({
    initialExistingFiles: initialDraft?.existingFiles ?? [],
    initialNewFiles: initialDraft?.newFiles ?? [],
    isRevision,
    tenantGlobalId,
  });

  useEffect(() => {
    if (requestToClone && !initialDraft) {
      setTitle(requestToClone.title);
      setExistingFiles(
        (requestToClone.requestFiles?.length ? requestToClone.requestFiles : [])
          .filter((file) => file.revisionAction !== ApprovalRequestFileRevisionAction.Removed)
          .map((file) => ({
            file: file.userFile,
            requestFileGlobalId: file.globalId,
          })),
      );
      setSteps(createEditableSteps(requestToClone.steps));
      setDescription(requestToClone.description ?? "");
    }

    if (tenantGlobalId && businessTenantIsSelected) {
      if (canUseEmployees) {
        stores.employeeStore.loadPicker(tenantGlobalId);
      }
      if (canUseTeams) {
        stores.teamStore.loadPicker(tenantGlobalId);
      }
      if (canUseTemplates && initialTemplateGlobalId) {
        void stores.approvalStepTemplateStore.loadDetail(tenantGlobalId, initialTemplateGlobalId).then((template) => {
          if (initialTemplateHasBeenApplied.current) {
            return;
          }

          if (template) {
            setTitle(template.name);
            setDescription(template.description ?? "");
            setSteps(createEditableSteps(template.steps));
          }
          initialTemplateHasBeenApplied.current = true;
        });
      }
    }
  }, [
    requestToClone,
    initialDraft,
    tenantGlobalId,
    businessTenantIsSelected,
    canUseEmployees,
    canUseTeams,
    canUseTemplates,
    initialTemplateGlobalId,
    setExistingFiles,
    setSteps,
  ]);

  const handleUploadClick = () => {
    addedFilesUpload.openFileDialog();
  };

  const cleanUp = () => {
    setTitle("");
    clearFiles();
    setSteps([]);
    setDescription("");
    stores.approvalRequestStore.setRequestToClone(null);
  };

  const handleClose = () => {
    cleanUp();
    onClose();
  };

  const validateSteps = () => {
    if (steps.length === 0) {
      notification.warning("Add one or more approval steps.");
      return false;
    }

    const hasMissingRecipient = steps.some(
      (step) =>
        step.assignees.length === 0 ||
        step.assignees.some((assignee) => {
          if (assignee.type === AssigneeType.User) {
            return !assignee.email?.trim();
          }
          if (assignee.type === AssigneeType.Employee) {
            return !assignee.employeeGlobalId;
          }
          return !assignee.teamGlobalId;
        }),
    );

    if (hasMissingRecipient) {
      notification.warning("Specify valid assignees for every step.");
      return false;
    }
    return true;
  };

  const validateDraft = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      notification.warning("Title is required.");
      return false;
    }
    if (newFiles.length === 0 && existingFiles.length === 0) {
      notification.warning("Add one or more files.");
      return false;
    }
    return validateSteps();
  };

  const getSubmittedSteps = () => toApprovalStepSubmissions(steps);

  const saveTemplate = async () => {
    if (!tenantGlobalId || !canUseTemplates) {
      return;
    }

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      notification.warning("A title is required to save a template.");
      return;
    }
    if (!validateSteps()) {
      return;
    }

    await saveTemplateAction.run(async () => {
      await stores.approvalStepTemplateStore.load(tenantGlobalId);
      const payload = {
        description,
        name: trimmedTitle,
        steps: getSubmittedSteps(),
      };
      const existingTemplate = stores.approvalStepTemplateStore.templates.find(
        (template) => template.name.localeCompare(trimmedTitle, undefined, { sensitivity: "base" }) === 0,
      );
      const template = existingTemplate
        ? await stores.approvalStepTemplateStore.update(tenantGlobalId, existingTemplate.globalId, payload)
        : await stores.approvalStepTemplateStore.create(tenantGlobalId, payload);
      if (template) {
        showPersistenceSuccessNotification(PersistenceSuccessMessages.templateSaved);
      }
    });
  };

  const submit = async () => {
    const trimmedTitle = title.trim();
    if (!validateDraft()) {
      return;
    }
    if (!tenantGlobalId) {
      return;
    }

    await submitAction.run(async () => {
      const requestFiles: ApprovalRequestFileSubmission[] = [];

      existingFiles.forEach((file, index) => {
        if (file.removed) {
          requestFiles.push({
            userFileGlobalId: file.file.globalId,
            sequence: index,
            revisionAction: ApprovalRequestFileRevisionAction.Removed,
            previousApprovalRequestFileGlobalId: file.requestFileGlobalId,
          });
          return;
        }

        if (file.replacement) {
          requestFiles.push({
            userFileGlobalId: file.replacement.globalId,
            sequence: index,
            revisionAction: ApprovalRequestFileRevisionAction.Replaced,
            previousApprovalRequestFileGlobalId: file.requestFileGlobalId,
          });
          return;
        }

        requestFiles.push({
          userFileGlobalId: file.file.globalId,
          sequence: index,
          revisionAction: isRevision
            ? ApprovalRequestFileRevisionAction.Unchanged
            : ApprovalRequestFileRevisionAction.Added,
          previousApprovalRequestFileGlobalId: file.requestFileGlobalId,
        });
      });

      newFiles.forEach((file, index) => {
        requestFiles.push({
          userFileGlobalId: file.globalId,
          sequence: existingFiles.length + index,
          revisionAction: ApprovalRequestFileRevisionAction.Added,
        });
      });

      const approvalRequestGlobalId =
        isRevision && requestToClone
          ? await resubmitApprovalRequest(
              tenantGlobalId,
              requestToClone.globalId,
              getSubmittedSteps(),
              description,
              requestFiles,
            )
          : await submitApprovalRequest(
              tenantGlobalId,
              trimmedTitle,
              getSubmittedSteps(),
              description,
              undefined,
              requestFiles,
            );
      if (approvalRequestGlobalId) {
        showPersistenceSuccessNotification(PersistenceSuccessMessages.approvalRequestSubmitted);
        cleanUp();
        stores.approvalRequestStore.clear();
        const [, createdRequest] = await Promise.all([
          stores.approvalRequestStore.load(tenantGlobalId),
          stores.approvalRequestStore.loadDetails(tenantGlobalId, approvalRequestGlobalId),
        ]);
        stores.approvalRequestStore.setCurrent(createdRequest ?? null);
        stores.approvalRequestTaskStore.loadUncompletedCount(tenantGlobalId);
        onClose(createdRequest?.globalId);
      }
    });
  };

  const handleSubmit = () => {
    if (hasIncompleteBusinessParticipantName(stores.tenantStore.currentTenant, stores.userProfileStore.profile)) {
      setNameWarningDialogIsOpen(true);
      return;
    }

    void submit();
  };

  const handleComposeSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleSubmit();
  };

  return (
    <CloseOnEscape onClose={handleClose}>
      <PageBreadcrumbs
        items={[
          {
            label: "Requests",
            state: requestToClone ? { currentApprovalRequestGlobalId: requestToClone.globalId } : undefined,
            to: requestsPath,
          },
          {
            label: isRevision ? "Resubmit request" : "New request",
          },
        ]}
      />
      <ApprovalRequestSubmitCompose
        canUseEmployees={canUseEmployees}
        canUseTeams={canUseTeams}
        description={description}
        employees={stores.employeeStore.pickerEmployees}
        existingFiles={existingFiles}
        fileInput={addedFilesUpload.fileInput}
        isFilesBusy={fileDeletion.isDeleting || addedFilesUpload.isUploading || replacementFilesUpload.isUploading}
        isFilesUploading={addedFilesUpload.isUploading}
        isRevision={isRevision}
        isSavingTemplate={saveTemplateAction.isRunning}
        isSubmitting={submitAction.isRunning}
        newFiles={newFiles}
        replacementFileInput={replacementFilesUpload.fileInput}
        showAttachmentRequirement={stores.applicationConfigurationStore.taskAttachmentsAreEnabled}
        showOrganizationEmployeesVisibility={businessTenantIsSelected}
        steps={steps}
        teams={stores.teamStore.pickerTeams}
        title={title}
        onAddAssignee={addAssignee}
        onAddStep={addStep}
        onCancel={handleClose}
        onDescriptionChange={setDescription}
        onFilesChange={addedFilesUpload.handleFilesChange}
        onMoveStep={moveStep}
        onRemoveAssignee={removeAssignee}
        onRemoveExisting={removeExistingFile}
        onRemoveNew={(index) => void removeNewFile(index)}
        onRemoveReplacement={(index) => void removeReplacementFile(index)}
        onRemoveStep={removeStep}
        onReplaceExisting={startReplacingExistingFile}
        onReplacementFilesChange={handleReplacementFilesChange}
        onRestoreExisting={restoreExistingFile}
        onSaveTemplate={canUseTemplates ? () => void saveTemplate() : undefined}
        onSubmit={handleComposeSubmit}
        onTitleChange={setTitle}
        onUpdateAssignee={updateAssignee}
        onUpdateStep={updateStep}
        onUploadClick={handleUploadClick}
      />
      {nameWarning && (
        <ConfirmationDialog
          cancelLabel="Go back"
          confirmLabel="Proceed anyway"
          message={nameWarning.message}
          open={nameWarningDialogIsOpen}
          title={nameWarning.title}
          onClose={() => setNameWarningDialogIsOpen(false)}
          onConfirm={async () => {
            await submit();
            return true;
          }}
        />
      )}
    </CloseOnEscape>
  );
};

export default observer(ApprovalRequestSubmit);
