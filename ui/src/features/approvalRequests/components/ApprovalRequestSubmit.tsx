import { stores } from "@/app/rootStore";
import { resubmitApprovalRequest, submitApprovalRequest } from "@/features/approvalRequests/api/approvalRequestsApi";
import { RevisionExistingFile } from "@/features/approvalRequests/components/ApprovalRequestFilesList";
import ApprovalRequestSubmitCompose from "@/features/approvalRequests/components/ApprovalRequestSubmitCompose";
import ApprovalRequestSubmitVisibility, {
  StepVisibilityMode,
} from "@/features/approvalRequests/components/ApprovalRequestSubmitVisibility";
import {
  ApprovalRequestFile,
  ApprovalRequestFileRevisionAction,
  ApprovalRequestFileSubmission,
  ApprovalRequestStepVisibilitySubmission,
} from "@/features/approvalRequests/models/approvalRequest";
import { useApprovalRequestSubmitFiles } from "@/features/approvalRequests/hooks/useApprovalRequestSubmitFiles";
import { getIncompleteParticipantNameWarning } from "@/features/approvalRequests/utils/incompleteParticipantNameWarning";
import { hasIncompleteBusinessParticipantName } from "@/features/approvalRequests/utils/participantName";
import { getApprovalRequestAssigneeVisibilityKey } from "@/features/approvalRequests/utils/approvalRequestVisibility";
import {
  ApprovalStep,
  ApprovalStepVisibilityMode,
  AssigneeType,
} from "@/features/approvalWorkflow/models/approvalStep";
import { useEditableApprovalSteps } from "@/features/approvalWorkflow/hooks/useEditableApprovalSteps";
import {
  createEditableSteps,
  EditableApprovalStep,
  toApprovalStepSubmissions,
} from "@/features/approvalWorkflow/models/editableApprovalStep";
import { TenantType } from "@/features/tenants/models/tenant";
import { UserFile } from "@/features/userFiles/models/userFile";
import ConfirmationDialog from "@/shared/components/dialogs/ConfirmationDialog";
import CloseOnEscape from "@/shared/components/navigation/CloseOnEscape";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import { Routes } from "@/shared/constants/constants";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
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
  isVisibilityPage?: boolean;
  onClose: (currentApprovalRequestGlobalId?: string) => void;
  onComposeBreadcrumbClick: (draft: ApprovalRequestSubmitDraft) => void;
  onShowVisibility: (draft: ApprovalRequestSubmitDraft) => void;
  onShowCompose: (draft: ApprovalRequestSubmitDraft) => void;
}

export interface ApprovalRequestSubmitDraft {
  description: string;
  existingFiles: RevisionExistingFile[];
  newFiles: UserFile[];
  stepVisibility: Record<string, boolean>;
  stepVisibilityModes: Record<number, StepVisibilityMode>;
  steps: EditableApprovalStep[];
  title: string;
}

let cachedDraft: ApprovalRequestSubmitDraft | null = null;

export const cacheApprovalRequestSubmitDraft = (draft: ApprovalRequestSubmitDraft) => {
  cachedDraft = draft;
};

export const getCachedApprovalRequestSubmitDraft = () => cachedDraft;

const visibilityModeValues: Record<StepVisibilityMode, ApprovalStepVisibilityMode> = {
  all: ApprovalStepVisibilityMode.AllParticipants,
  allExcept: ApprovalStepVisibilityMode.AllParticipantsExceptSelected,
  assignees: ApprovalStepVisibilityMode.AssigneesOnly,
  selected: ApprovalStepVisibilityMode.AssigneesAndSelectedParticipants,
};
const stepVisibilityModesByValue: Record<ApprovalStepVisibilityMode, StepVisibilityMode> = {
  [ApprovalStepVisibilityMode.AllParticipants]: "all",
  [ApprovalStepVisibilityMode.AllParticipantsExceptSelected]: "allExcept",
  [ApprovalStepVisibilityMode.AssigneesAndSelectedParticipants]: "selected",
  [ApprovalStepVisibilityMode.AssigneesOnly]: "assignees",
};

const getPersistedVisibilityState = (steps: ApprovalStep[]) => {
  const stepVisibility: Record<string, boolean> = {};
  const stepVisibilityModes: Record<number, StepVisibilityMode> = {};

  steps.forEach((step) => {
    const ownAssigneeGlobalIds = new Set(step.assignees.map((assignee) => assignee.globalId));
    const hasHiddenParticipant = (step.visibility ?? []).some(
      (visibility) => !ownAssigneeGlobalIds.has(visibility.assigneeGlobalId) && !visibility.isVisible,
    );
    stepVisibilityModes[step.sequence] =
      step.visibilityMode === undefined
        ? hasHiddenParticipant
          ? "allExcept"
          : "all"
        : stepVisibilityModesByValue[step.visibilityMode];

    (step.visibility ?? []).forEach((visibility) => {
      const assigneeStep = steps.find((candidate) =>
        candidate.assignees.some((assignee) => assignee.globalId === visibility.assigneeGlobalId),
      );
      const assigneeIndex = assigneeStep?.assignees.findIndex(
        (assignee) => assignee.globalId === visibility.assigneeGlobalId,
      );
      if (!assigneeStep || assigneeIndex === undefined || assigneeIndex < 0) {
        return;
      }

      stepVisibility[getApprovalRequestAssigneeVisibilityKey(step.sequence, assigneeStep.sequence, assigneeIndex)] =
        visibility.isVisible;
    });
  });

  return { stepVisibility, stepVisibilityModes };
};

const toDraftRequestFile = (
  file: UserFile,
  sequence: number,
  revisionAction: ApprovalRequestFileRevisionAction,
  previousApprovalRequestFileGlobalId?: string,
): ApprovalRequestFile => {
  return {
    globalId: file.globalId,
    userFile: {
      globalId: file.globalId,
      name: file.name,
      type: file.type,
      size: file.size,
      checked: false,
      createdAt: "",
      createdAtDate: new Date(),
    },
    sequence,
    revisionAction,
    previousApprovalRequestFileGlobalId,
  };
};

const ApprovalRequestSubmit: React.FC<ApprovalRequestSubmitProps> = ({
  initialDraft,
  initialTemplateGlobalId,
  isVisibilityPage = false,
  onClose,
  onComposeBreadcrumbClick,
  onShowCompose,
  onShowVisibility,
}) => {
  const [title, setTitle] = useState(initialDraft?.title ?? "");
  const [description, setDescription] = useState(initialDraft?.description ?? "");
  const [stepVisibility, setStepVisibility] = useState<Record<string, boolean>>(initialDraft?.stepVisibility ?? {});
  const [stepVisibilityModes, setStepVisibilityModes] = useState<Record<number, StepVisibilityMode>>(
    initialDraft?.stepVisibilityModes ?? {},
  );
  const [nameWarningDialogIsOpen, setNameWarningDialogIsOpen] = useState(false);
  const nameWarning = getIncompleteParticipantNameWarning(stores.tenantStore.currentTenant?.type);
  const submitAction = useAsyncAction(ActionLoaders.approvalRequests.submit());
  const initialTemplateHasBeenApplied = useRef(false);

  const tenantGlobalId = stores.tenantStore.currentTenantGlobalId;
  const outboxPath = tenantGlobalId ? Routes.tenantPath(tenantGlobalId, "/outbox") : "/";
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
      initialSteps: initialDraft?.steps ?? [],
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
      const persistedVisibilityState = getPersistedVisibilityState(requestToClone.steps);
      setStepVisibility(persistedVisibilityState.stepVisibility);
      setStepVisibilityModes(persistedVisibilityState.stepVisibilityModes);
      setDescription(requestToClone.description ?? "");
    }

    if (tenantGlobalId && businessTenantIsSelected) {
      if (canUseEmployees) {
        stores.employeeStore.load(tenantGlobalId);
      }
      if (canUseTeams) {
        stores.teamStore.load(tenantGlobalId);
      }
      if (canUseTemplates) {
        void stores.approvalStepTemplateStore.load(tenantGlobalId).then(() => {
          if (initialTemplateHasBeenApplied.current || !initialTemplateGlobalId) {
            return;
          }

          const template = stores.approvalStepTemplateStore.templates.find(
            (item) => item.globalId === initialTemplateGlobalId,
          );
          if (template) {
            setTitle(template.name);
            setSteps(createEditableSteps(template.steps));
            const persistedVisibilityState = getPersistedVisibilityState(template.steps);
            setStepVisibility(persistedVisibilityState.stepVisibility);
            setStepVisibilityModes(persistedVisibilityState.stepVisibilityModes);
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
    setStepVisibility({});
    setStepVisibilityModes({});
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

  const getStepVisibilityValue = (stepSequence: number, assigneeStepSequence: number, assigneeIndex: number) =>
    stepVisibility[getApprovalRequestAssigneeVisibilityKey(stepSequence, assigneeStepSequence, assigneeIndex)] ??
    (stepVisibilityModes[stepSequence] ?? "all") === "all";

  const getDisplayStep = (step: EditableApprovalStep): ApprovalStep => ({
    ...step,
    assignees: step.assignees.map((assignee) => {
      if (assignee.type === AssigneeType.Employee) {
        const employee = stores.employeeStore.employees.find((item) => item.globalId === assignee.employeeGlobalId);
        return {
          ...assignee,
          displayName: assignee.displayName ?? employee?.displayName,
          email: assignee.email ?? employee?.email,
        };
      }

      if (assignee.type === AssigneeType.Team) {
        const team = stores.teamStore.teams.find((item) => item.globalId === assignee.teamGlobalId);
        return {
          ...assignee,
          displayName: assignee.displayName ?? team?.name,
        };
      }

      return assignee;
    }),
  });

  const createStepVisibilitySubmissions = (): ApprovalRequestStepVisibilitySubmission[] =>
    steps.flatMap((step) =>
      steps.flatMap((assigneeStep) =>
        assigneeStep.assignees.map((_, assigneeIndex) => ({
          stepSequence: step.sequence,
          assigneeStepSequence: assigneeStep.sequence,
          assigneeIndex,
          isVisible:
            step.sequence === assigneeStep.sequence ||
            getStepVisibilityValue(step.sequence, assigneeStep.sequence, assigneeIndex),
        })),
      ),
    );

  const getSubmittedSteps = () =>
    toApprovalStepSubmissions(
      steps.map((step) => ({
        ...step,
        visibilityMode: visibilityModeValues[stepVisibilityModes[step.sequence] ?? "all"],
      })),
    );

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
              createStepVisibilitySubmissions(),
              description,
              requestFiles,
            )
          : await submitApprovalRequest(
              tenantGlobalId,
              trimmedTitle,
              getSubmittedSteps(),
              createStepVisibilitySubmissions(),
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
    if (steps.length < 2) {
      handleSubmit();
      return;
    }
    if (!validateDraft()) {
      return;
    }
    onShowVisibility(createDraft());
  };

  const createDraft = (): ApprovalRequestSubmitDraft => ({
    description,
    existingFiles,
    newFiles,
    stepVisibility,
    stepVisibilityModes,
    steps,
    title,
  });

  const draftRequestFiles: ApprovalRequestFile[] = [
    ...existingFiles.map((file, index) =>
      file.replacement
        ? toDraftRequestFile(
            file.replacement,
            index,
            ApprovalRequestFileRevisionAction.Replaced,
            file.requestFileGlobalId,
          )
        : {
            globalId: file.requestFileGlobalId ?? file.file.globalId,
            userFile: file.file,
            sequence: index,
            revisionAction: isRevision
              ? ApprovalRequestFileRevisionAction.Unchanged
              : ApprovalRequestFileRevisionAction.Added,
            previousApprovalRequestFileGlobalId: file.requestFileGlobalId,
          },
    ),
    ...newFiles.map((file, index) =>
      toDraftRequestFile(file, existingFiles.length + index, ApprovalRequestFileRevisionAction.Added),
    ),
  ];

  return (
    <CloseOnEscape onClose={handleClose}>
      <PageBreadcrumbs
        items={[
          {
            label: "Outbox",
            state: requestToClone ? { currentApprovalRequestGlobalId: requestToClone.globalId } : undefined,
            to: outboxPath,
          },
          {
            label: isRevision ? "Resubmit request" : "New request",
            onClick: isVisibilityPage ? () => onComposeBreadcrumbClick(createDraft()) : undefined,
          },
          ...(isVisibilityPage ? [{ label: "Visibility" }] : []),
        ]}
      />
      {!isVisibilityPage && (
        <ApprovalRequestSubmitCompose
          canUseEmployees={canUseEmployees}
          canUseTeams={canUseTeams}
          description={description}
          employees={stores.employeeStore.employees}
          existingFiles={existingFiles}
          fileInput={addedFilesUpload.fileInput}
          isFilesBusy={fileDeletion.isDeleting || addedFilesUpload.isUploading || replacementFilesUpload.isUploading}
          isFilesUploading={addedFilesUpload.isUploading}
          isRevision={isRevision}
          isSubmitting={submitAction.isRunning}
          newFiles={newFiles}
          replacementFileInput={replacementFilesUpload.fileInput}
          showAttachmentRequirement={stores.applicationConfigurationStore.taskAttachmentsAreEnabled}
          steps={steps}
          teams={stores.teamStore.teams}
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
          onSubmit={handleComposeSubmit}
          onTitleChange={setTitle}
          onUpdateAssignee={updateAssignee}
          onUpdateStep={updateStep}
          onUploadClick={handleUploadClick}
        />
      )}
      {isVisibilityPage && (
        <ApprovalRequestSubmitVisibility
          canUseEmployees={canUseEmployees}
          canUseTeams={canUseTeams}
          description={description}
          employees={stores.employeeStore.employees}
          getDisplayStep={getDisplayStep}
          isRevision={isRevision}
          isSubmitting={submitAction.isRunning}
          requestFiles={draftRequestFiles}
          showAttachmentRequirement={stores.applicationConfigurationStore.taskAttachmentsAreEnabled}
          stepVisibility={stepVisibility}
          stepVisibilityModes={stepVisibilityModes}
          steps={steps}
          teams={stores.teamStore.teams}
          title={title}
          onBack={() => onShowCompose(createDraft())}
          onStepVisibilityChange={setStepVisibility}
          onStepVisibilityModesChange={setStepVisibilityModes}
          onSubmit={handleSubmit}
        />
      )}
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
