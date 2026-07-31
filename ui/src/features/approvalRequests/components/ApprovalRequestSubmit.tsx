import { stores } from "@/app/rootStore";
import {
  resubmitApprovalRequest,
  submitApprovalRequest,
} from "@/features/approvalRequests/api/approvalRequestsApi";
import ApprovalRequestFilesList, {
  RevisionExistingFile,
} from "@/features/approvalRequests/components/ApprovalRequestFilesList";
import {
  ApprovalRequestFileRevisionAction,
  ApprovalRequestFileSubmission,
  ApprovalRequestStepVisibilitySubmission,
} from "@/features/approvalRequests/models/approvalRequest";
import ApprovalStepEditor from "@/features/approvalWorkflow/components/ApprovalStepEditor";
import {
  ApprovalRecipientType,
  ApprovalStepApprover,
} from "@/features/approvalWorkflow/models/approvalStep";
import {
  createEditableSteps,
  createEmptyApprover,
  createEmptyStep,
  EditableApprovalStep,
  toApprovalStepSubmissions,
} from "@/features/approvalWorkflow/models/editableApprovalStep";
import { TenantType } from "@/features/tenants/models/tenant";
import { uploadUserFiles } from "@/features/userFiles/api/userFilesApi";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import { Dialogs, Files, Routes } from "@/shared/constants/constants";
import {
  PersistenceSuccessMessages,
  showPersistenceSuccessToast,
} from "@/shared/utils/toasts";
import { validateEmails } from "@/shared/utils/validators";
import { Add, ArrowBack, ArrowForward, AttachFile } from "@mui/icons-material";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { observer } from "mobx-react-lite";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

interface ApprovalRequestSubmitProps {
  initialTemplateGlobalId?: string;
  onClose: (currentApprovalRequestGlobalId?: string) => void;
}

const ApprovalRequestSubmit: React.FC<ApprovalRequestSubmitProps> = ({
  initialTemplateGlobalId,
  onClose,
}) => {
  const fileInput = useRef<HTMLInputElement>(null);
  const replacementFileInput = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [existingFiles, setExistingFiles] = useState<RevisionExistingFile[]>([]);
  const [removedExistingFiles, setRemovedExistingFiles] = useState<RevisionExistingFile[]>([]);
  const [steps, setSteps] = useState<EditableApprovalStep[]>([]);
  const [description, setDescription] = useState("");
  const [replacementFileIndex, setReplacementFileIndex] = useState<number | null>(null);
  const [submitPage, setSubmitPage] = useState<"compose" | "visibility">("compose");
  const [stepVisibility, setStepVisibility] = useState<Record<string, boolean>>({});
  const initialTemplateHasBeenApplied = useRef(false);

  const tenantGlobalId = stores.tenantStore.currentTenantGlobalId;
  const outboxPath = tenantGlobalId ? Routes.tenantPath(tenantGlobalId, "/outbox") : "/";
  const businessTenantIsSelected =
    stores.tenantStore.currentTenant?.type === TenantType.Business;
  const canUseEmployees =
    businessTenantIsSelected && stores.productStore.employeeApproversAreEnabled;
  const canUseTeams =
    businessTenantIsSelected && stores.productStore.teamApproversAreEnabled;
  const canRequireIdentityVerification =
    stores.productStore.identityVerificationIsEnabled;
  const canUseTemplates =
    businessTenantIsSelected &&
    stores.productStore.approvalStepTemplatesAreEnabled &&
    tenantGlobalId !== null;
  const requestToClone = stores.approvalRequestStore.requestToClone;
  const isRevision = Boolean(
    requestToClone && stores.productStore.approvalRequestRevisionsAreEnabled,
  );

  useEffect(() => {
    if (requestToClone) {
      setTitle(requestToClone.title);
      setExistingFiles(
        (requestToClone.requestFiles?.length
          ? requestToClone.requestFiles
          : []
        )
          .filter((file) => file.revisionAction !== ApprovalRequestFileRevisionAction.Removed)
          .map((file) => ({
            file: file.userFile,
            requestFileGlobalId: file.globalId,
          })),
      );
      setRemovedExistingFiles([]);
      setSteps(createEditableSteps(requestToClone.steps));
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
            setSteps(createEditableSteps(template.steps));
          }
          initialTemplateHasBeenApplied.current = true;
        });
      }
    }
  }, [
    requestToClone,
    tenantGlobalId,
    businessTenantIsSelected,
    canUseEmployees,
    canUseTeams,
    canUseTemplates,
    initialTemplateGlobalId,
  ]);

  const handleUploadClick = () => {
    fileInput.current?.click();
  };

  const handleFilesChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.currentTarget.files ?? []);
    setNewFiles((currentFiles) => [...currentFiles, ...selectedFiles]);
    event.currentTarget.value = "";
  };

  const handleReplacementFilesChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.currentTarget.files?.[0];
    if (replacementFileIndex !== null && selectedFile) {
      setExistingFiles((files) =>
        files.map((file, index) =>
          index === replacementFileIndex
            ? { ...file, removed: false, replacement: selectedFile }
            : file,
        ),
      );
    }
    setReplacementFileIndex(null);
    event.currentTarget.value = "";
  };

  const removeExistingFile = (index: number) => {
    const fileToRemove = existingFiles[index];
    if (!fileToRemove) {
      return;
    }

    setExistingFiles((files) => files.filter((_, i) => i !== index));
    if (isRevision) {
      setRemovedExistingFiles((files) => [
        ...files,
        { ...fileToRemove, removed: true, replacement: undefined },
      ]);
    }
  };

  const cleanUp = () => {
    setTitle("");
    setNewFiles([]);
    setExistingFiles([]);
    setRemovedExistingFiles([]);
    setSteps([]);
    setDescription("");
    setReplacementFileIndex(null);
    setSubmitPage("compose");
    setStepVisibility({});
    stores.approvalRequestStore.setRequestToClone(null);
  };

  const handleClose = () => {
    cleanUp();
    onClose();
  };

  const updateStep = (
    stepIndex: number,
    updater: (step: EditableApprovalStep) => EditableApprovalStep,
  ) => {
    setSteps((current) =>
      current.map((step, index) =>
        index === stepIndex ? updater(step) : step,
      ),
    );
  };

  const addStep = () => {
    setSteps((current) => [
      ...current,
      createEmptyStep(current.length + 1),
    ]);
  };

  const removeStep = (stepIndex: number) => {
    setSteps((current) =>
      current
        .filter((_, index) => index !== stepIndex)
        .map((step, index) => ({ ...step, sequence: index + 1 })),
    );
  };

  const moveStep = (stepIndex: number, direction: -1 | 1) => {
    const nextIndex = stepIndex + direction;
    setSteps((current) => {
      if (nextIndex < 0 || nextIndex >= current.length) {
        return current;
      }

      const reordered = [...current];
      [reordered[stepIndex], reordered[nextIndex]] = [
        reordered[nextIndex],
        reordered[stepIndex],
      ];
      return reordered.map((step, index) => ({ ...step, sequence: index + 1 }));
    });
  };

  const addApprover = (stepIndex: number) => {
    updateStep(stepIndex, (step) => ({
      ...step,
      approvers: [...step.approvers, createEmptyApprover()],
    }));
  };

  const updateApprover = (
    stepIndex: number,
    approverIndex: number,
    approver: ApprovalStepApprover,
  ) => {
    updateStep(stepIndex, (step) => ({
      ...step,
      approvers: step.approvers.map((item, index) =>
        index === approverIndex ? approver : item,
      ),
    }));
  };

  const removeApprover = (stepIndex: number, approverIndex: number) => {
    updateStep(stepIndex, (step) => ({
      ...step,
      approvers: step.approvers.filter((_, index) => index !== approverIndex),
    }));
  };

  const validateSteps = () => {
    if (steps.length === 0) {
      toast.error("Add one or more approval steps.");
      return false;
    }

    const emails = steps.flatMap((step) =>
      step.approvers
        .filter((approver) => approver.type === ApprovalRecipientType.Email)
        .map((approver) => approver.email ?? ""),
    );
    const hasMissingRecipient = steps.some(
      (step) =>
        step.approvers.length === 0 ||
        step.approvers.some((approver) => {
          if (approver.type === ApprovalRecipientType.Email) {
            return !approver.email?.trim();
          }
          if (approver.type === ApprovalRecipientType.Employee) {
            return !approver.employeeGlobalId;
          }
          return !approver.teamGlobalId;
        }),
    );

    if (hasMissingRecipient || (emails.length > 0 && !validateEmails(emails))) {
      toast.error("Specify valid approvers for every step.");
      return false;
    }
    return true;
  };

  const validateDraft = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      toast.error("Title is required.");
      return false;
    }
    if (newFiles.length === 0 && existingFiles.length === 0) {
      toast.error("Add one or more files.");
      return false;
    }
    return validateSteps();
  };

  const handleConfigureVisibility = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateDraft()) {
      return;
    }
    setSubmitPage("visibility");
  };

  const getApproverVisibilityKey = (
    stepSequence: number,
    approverStepSequence: number,
    approverIndex: number,
  ) => `${stepSequence}:${approverStepSequence}:${approverIndex}`;

  const getRequestApprovers = () =>
    steps.flatMap((step) =>
      step.approvers.map((approver, approverIndex) => ({
        approver,
        approverIndex,
        stepSequence: step.sequence,
      })),
    );

  const getApproverLabel = (
    approver: ApprovalStepApprover,
  ) => {
    if (approver.displayName) {
      return approver.displayName;
    }
    if (approver.type === ApprovalRecipientType.Employee) {
      return stores.employeeStore.employees.find((employee) => employee.globalId === approver.employeeGlobalId)?.displayName ?? "Employee";
    }
    if (approver.type === ApprovalRecipientType.Team) {
      return stores.teamStore.teams.find((team) => team.globalId === approver.teamGlobalId)?.name ?? "Team";
    }
    return approver.email || "Email";
  };

  const getStepVisibilityValue = (
    stepSequence: number,
    approverStepSequence: number,
    approverIndex: number,
  ) => stepVisibility[getApproverVisibilityKey(stepSequence, approverStepSequence, approverIndex)] ?? true;

  const setStepVisibilityValue = (
    stepSequence: number,
    approverStepSequence: number,
    approverIndex: number,
    isVisible: boolean,
  ) => {
    setStepVisibility((current) => ({
      ...current,
      [getApproverVisibilityKey(stepSequence, approverStepSequence, approverIndex)]: isVisible,
    }));
  };

  const createStepVisibilitySubmissions = (): ApprovalRequestStepVisibilitySubmission[] =>
    steps.flatMap((step) =>
      getRequestApprovers().map((approver) => ({
        stepSequence: step.sequence,
        approverStepSequence: approver.stepSequence,
        approverIndex: approver.approverIndex,
        isVisible: step.sequence === approver.stepSequence ||
          getStepVisibilityValue(
            step.sequence,
            approver.stepSequence,
            approver.approverIndex,
          ),
      })),
    );

  const handleSubmit = async () => {
    const trimmedTitle = title.trim();
    if (!validateDraft()) {
      return;
    }
    if (!tenantGlobalId) {
      return;
    }

    const replacementFiles = existingFiles
      .map((file) => file.replacement)
      .filter((file): file is File => Boolean(file));
    const filesToUpload = [...replacementFiles, ...newFiles];
    const uploadedFiles = await uploadUserFiles(tenantGlobalId, filesToUpload);
    if (uploadedFiles.length !== filesToUpload.length) {
      toast.error("One or more files could not be uploaded.");
      return;
    }

    const uploadedReplacements = uploadedFiles.slice(0, replacementFiles.length);
    const uploadedNewFiles = uploadedFiles.slice(replacementFiles.length);
    let replacementIndex = 0;
    const requestFiles: ApprovalRequestFileSubmission[] = [];

    existingFiles.forEach((file, index) => {
      if (file.replacement) {
        const replacement = uploadedReplacements[replacementIndex++];
        requestFiles.push({
          userFileGlobalId: replacement.globalId,
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

    uploadedNewFiles.forEach((file, index) => {
      requestFiles.push({
        userFileGlobalId: file.globalId,
        sequence: existingFiles.length + index,
        revisionAction: isRevision
          ? ApprovalRequestFileRevisionAction.Added
          : ApprovalRequestFileRevisionAction.Unchanged,
      });
    });

    removedExistingFiles.forEach((file, index) => {
      requestFiles.push({
        userFileGlobalId: file.file.globalId,
        sequence: existingFiles.length + uploadedNewFiles.length + index,
        revisionAction: ApprovalRequestFileRevisionAction.Removed,
        previousApprovalRequestFileGlobalId: file.requestFileGlobalId,
      });
    });

    const approvalRequestGlobalId = isRevision && requestToClone
      ? await resubmitApprovalRequest(
        tenantGlobalId,
        requestToClone.globalId,
        toApprovalStepSubmissions(steps),
        createStepVisibilitySubmissions(),
        description,
        requestFiles,
      )
      : await submitApprovalRequest(
        tenantGlobalId,
        trimmedTitle,
        toApprovalStepSubmissions(steps),
        createStepVisibilitySubmissions(),
        description,
        undefined,
        requestFiles,
      );
    if (approvalRequestGlobalId) {
      showPersistenceSuccessToast(
        PersistenceSuccessMessages.approvalRequestSubmitted,
      );
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
  };

  return (
    <>
      <PageBreadcrumbs
        items={[
          {
            label: "Outbox",
            state: requestToClone ? { currentApprovalRequestGlobalId: requestToClone.globalId } : undefined,
            to: outboxPath,
          },
          { label: isRevision ? "Resubmit request" : "New request" },
        ]}
      />
      {submitPage === "compose" && (
      <Box component="form" onSubmit={handleConfigureVisibility}>
        <Stack spacing={Dialogs.formStackSpacing} sx={Dialogs.tabContentSx}>
          <TextField
            autoFocus
            margin="normal"
            fullWidth
            label="Title"
            required
            value={title}
            disabled={isRevision}
            onChange={(event) => setTitle(event.target.value)}
          />
          <ApprovalRequestFilesList
            existingFiles={existingFiles}
            newFiles={newFiles}
            onRemoveExisting={removeExistingFile}
            onRemoveNew={(index) =>
              setNewFiles((files) => files.filter((_, i) => i !== index))
            }
            onRemoveReplacement={(index) =>
              setExistingFiles((files) =>
                files.map((file, i) =>
                  i === index ? { ...file, replacement: undefined } : file,
                ),
              )
            }
            onReplaceExisting={isRevision
              ? (index) => {
                setReplacementFileIndex(index);
                replacementFileInput.current?.click();
              }
              : undefined}
          />
          <Box sx={Dialogs.bottomSpacingSx}>
            <Button startIcon={<AttachFile />} onClick={handleUploadClick}>
              Add files
            </Button>
            <input
              type="file"
              multiple
              onChange={handleFilesChange}
              ref={fileInput}
              style={Files.inputStyle}
            />
            <input
              type="file"
              onChange={handleReplacementFilesChange}
              ref={replacementFileInput}
              style={Files.inputStyle}
            />
          </Box>
          <TextField
            margin="normal"
            fullWidth
            label="Description"
            multiline
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
          <ApprovalStepEditor
            steps={steps}
            canRequireIdentityVerification={canRequireIdentityVerification}
            canUseEmployees={canUseEmployees}
            canUseTeams={canUseTeams}
            employees={stores.employeeStore.employees}
            teams={stores.teamStore.teams}
            onAddApprover={addApprover}
            onAddStep={addStep}
            onMoveStep={moveStep}
            onRemoveApprover={removeApprover}
            onRemoveStep={removeStep}
            onUpdateApprover={updateApprover}
            onUpdateStep={updateStep}
            showAddStep={false}
          />
          <Box sx={Dialogs.textBottomSpacingSx}>
            <Button startIcon={<Add />} onClick={addStep}>
              Add step
            </Button>
          </Box>
        </Stack>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={Dialogs.stepHeaderSpacing}
          sx={Dialogs.addStepButtonSx}
        >
          <Button variant="outlined" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" endIcon={<ArrowForward />}>
            VISIBILITY
          </Button>
        </Stack>
      </Box>
      )}
      {submitPage === "visibility" && (
        <>
          <Stack spacing={Dialogs.formStackSpacing} sx={Dialogs.tabContentSx}>
            <Typography component="h1" variant="h5">
              Visibility
            </Typography>
            <Stack spacing={Dialogs.stepStackSpacing}>
              {steps.map((step) => (
                <Stack key={step.sequence} spacing={Dialogs.approverStackSpacing}>
                  <Typography variant="subtitle1">
                    Step {step.sequence}
                  </Typography>
                  <Stack spacing={Dialogs.approverStackSpacing}>
                    {getRequestApprovers().map((approver) => {
                      const isStepApprover = step.sequence === approver.stepSequence;
                      return (
                        <FormControlLabel
                          key={`${step.sequence}-${approver.stepSequence}-${approver.approverIndex}`}
                          control={
                            <Checkbox
                              checked={isStepApprover ||
                                getStepVisibilityValue(
                                  step.sequence,
                                  approver.stepSequence,
                                  approver.approverIndex,
                                )}
                              disabled={isStepApprover}
                              onChange={(_, checked) =>
                                setStepVisibilityValue(
                                  step.sequence,
                                  approver.stepSequence,
                                  approver.approverIndex,
                                  checked,
                                )
                              }
                            />
                          }
                          label={`${getApproverLabel(approver.approver)} (Step ${approver.stepSequence})`}
                        />
                      );
                    })}
                  </Stack>
                </Stack>
              ))}
            </Stack>
          </Stack>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={Dialogs.stepHeaderSpacing}
            sx={Dialogs.addStepButtonSx}
          >
            <Button
              startIcon={<ArrowBack />}
              onClick={() => setSubmitPage("compose")}
            >
              BACK
            </Button>
            <Button variant="outlined" onClick={handleSubmit}>
              Submit
            </Button>
          </Stack>
        </>
      )}
    </>
  );
};

export default observer(ApprovalRequestSubmit);
