import { stores } from "@/app/rootStore";
import {
  resubmitApprovalRequest,
  submitApprovalRequest,
} from "@/features/approvalRequests/api/approvalRequestsApi";
import ApprovalRequestFilesList, {
  RevisionExistingFile,
} from "@/features/approvalRequests/components/ApprovalRequestFilesList";
import {
  getAssigneeIcon,
} from "@/features/approvalRequests/components/ApprovalRequestParticipantLine";
import ApprovalRequestSummary from "@/features/approvalRequests/components/ApprovalRequestSummary";
import {
  ApprovalRequestFile,
  ApprovalRequestFileRevisionAction,
  ApprovalRequestFileSubmission,
  ApprovalRequestStepVisibilitySubmission,
} from "@/features/approvalRequests/models/approvalRequest";
import ApprovalStepBlock from "@/features/approvalWorkflow/components/ApprovalStepBlock";
import ApprovalStepEditor from "@/features/approvalWorkflow/components/ApprovalStepEditor";
import {
  AssigneeType,
  ApprovalStep,
  ApprovalStepAssignee,
} from "@/features/approvalWorkflow/models/approvalStep";
import {
  createEditableSteps,
  createEmptyAssignee,
  createEmptyStep,
  EditableApprovalStep,
  toApprovalStepSubmissions,
} from "@/features/approvalWorkflow/models/editableApprovalStep";
import { TenantType } from "@/features/tenants/models/tenant";
import { getIncompleteParticipantNameWarning } from "@/features/approvalRequests/utils/incompleteParticipantNameWarning";
import { uploadUserFiles } from "@/features/userFiles/api/userFilesApi";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import ConfirmationDialog from "@/shared/components/dialogs/ConfirmationDialog";
import { Dialogs, Files, Routes } from "@/shared/constants/constants";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
import {
  PersistenceSuccessMessages,
  showPersistenceSuccessToast,
} from "@/shared/utils/toasts";
import { validateEmails } from "@/shared/utils/validators";
import { Add, ArrowBack, ArrowForward, AttachFile } from "@mui/icons-material";
import LoadingButton from "@mui/lab/LoadingButton";
import type { SxProps } from "@mui/material";
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { observer } from "mobx-react-lite";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

interface ApprovalRequestSubmitProps {
  initialTemplateGlobalId?: string;
  onClose: (currentApprovalRequestGlobalId?: string) => void;
}

interface RequestAssigneeOption {
  assigneeIndex: number;
  key: string;
  label: string;
  stepSequence: number;
  type: AssigneeType;
}

const visibilityOptionSx: SxProps<Theme> = { minWidth: 0 };
const visibilitySummarySx: SxProps<Theme> = { ...Dialogs.approvalBoxSx };

const toDraftRequestFile = (
  file: File,
  sequence: number,
  revisionAction: ApprovalRequestFileRevisionAction,
  previousApprovalRequestFileGlobalId?: string,
): ApprovalRequestFile => {
  const globalId = `draft-${sequence}-${file.name}-${file.lastModified}`;
  return {
    globalId,
    userFile: {
      globalId,
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
  const [nameWarningDialogIsOpen, setNameWarningDialogIsOpen] = useState(false);
  const nameWarning = getIncompleteParticipantNameWarning(stores.tenantStore.currentTenant?.type);
  const submitAction = useAsyncAction(ActionLoaders.approvalRequests.submit());
  const initialTemplateHasBeenApplied = useRef(false);

  const tenantGlobalId = stores.tenantStore.currentTenantGlobalId;
  const outboxPath = tenantGlobalId ? Routes.tenantPath(tenantGlobalId, "/outbox") : "/";
  const businessTenantIsSelected =
    stores.tenantStore.currentTenant?.type === TenantType.Business;
  const canUseEmployees =
    businessTenantIsSelected && stores.applicationConfigurationStore.employeeAssigneesAreEnabled;
  const canUseTeams =
    businessTenantIsSelected && stores.applicationConfigurationStore.teamAssigneesAreEnabled;
  const canUseTemplates =
    businessTenantIsSelected &&
    stores.applicationConfigurationStore.approvalStepTemplatesAreEnabled &&
    tenantGlobalId !== null;
  const requestToClone = stores.approvalRequestStore.requestToClone;
  const isRevision = Boolean(
    requestToClone && stores.applicationConfigurationStore.approvalRequestRevisionsAreEnabled,
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
            setTitle(template.name);
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

  const addAssignee = (stepIndex: number) => {
    updateStep(stepIndex, (step) => ({
      ...step,
      assignees: [...step.assignees, createEmptyAssignee()],
    }));
  };

  const updateAssignee = (
    stepIndex: number,
    assigneeIndex: number,
    assignee: ApprovalStepAssignee,
  ) => {
    updateStep(stepIndex, (step) => ({
      ...step,
      assignees: step.assignees.map((item, index) =>
        index === assigneeIndex ? assignee : item,
      ),
    }));
  };

  const removeAssignee = (stepIndex: number, assigneeIndex: number) => {
    updateStep(stepIndex, (step) => ({
      ...step,
      assignees: step.assignees.filter((_, index) => index !== assigneeIndex),
    }));
  };

  const validateSteps = () => {
    if (steps.length === 0) {
      toast.error("Add one or more approval steps.");
      return false;
    }

    const emails = steps.flatMap((step) =>
      step.assignees
        .filter((assignee) => assignee.type === AssigneeType.Email)
        .map((assignee) => assignee.email ?? ""),
    );
    const hasMissingRecipient = steps.some(
      (step) =>
        step.assignees.length === 0 ||
        step.assignees.some((assignee) => {
          if (assignee.type === AssigneeType.Email) {
            return !assignee.email?.trim();
          }
          if (assignee.type === AssigneeType.Employee) {
            return !assignee.employeeGlobalId;
          }
          return !assignee.teamGlobalId;
        }),
    );

    if (hasMissingRecipient || (emails.length > 0 && !validateEmails(emails))) {
      toast.error("Specify valid assignees for every step.");
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

  const getAssigneeVisibilityKey = (
    stepSequence: number,
    assigneeStepSequence: number,
    assigneeIndex: number,
  ) => `${stepSequence}:${assigneeStepSequence}:${assigneeIndex}`;

  const getRequestAssignees = (): RequestAssigneeOption[] =>
    steps.flatMap((step) =>
      step.assignees.map((assignee, assigneeIndex) => {
        const label = getAssigneeLabel(assignee);
        return {
          assigneeIndex,
          key: `${step.sequence}:${assigneeIndex}`,
          label,
          stepSequence: step.sequence,
          type: assignee.type,
        };
      }),
    );

  const getAssigneeLabel = (
    assignee: ApprovalStepAssignee,
  ) => {
    if (assignee.displayName) {
      return assignee.displayName;
    }
    if (assignee.type === AssigneeType.Employee) {
      return stores.employeeStore.employees.find((employee) => employee.globalId === assignee.employeeGlobalId)?.displayName ?? "Employee";
    }
    if (assignee.type === AssigneeType.Team) {
      return stores.teamStore.teams.find((team) => team.globalId === assignee.teamGlobalId)?.name ?? "Team";
    }
    return assignee.email || "Email";
  };

  const getStepVisibilityValue = (
    stepSequence: number,
    assigneeStepSequence: number,
    assigneeIndex: number,
  ) => stepVisibility[getAssigneeVisibilityKey(stepSequence, assigneeStepSequence, assigneeIndex)] ?? true;

  const getVisibleAssignees = (
    stepSequence: number,
    requestAssignees: RequestAssigneeOption[],
  ) =>
    requestAssignees.filter(
      (assignee) =>
        stepSequence === assignee.stepSequence ||
        getStepVisibilityValue(
          stepSequence,
          assignee.stepSequence,
          assignee.assigneeIndex,
        ),
    );

  const getAdditionalViewerOptions = (
    stepSequence: number,
    requestAssignees: RequestAssigneeOption[],
  ) => requestAssignees.filter((assignee) => assignee.stepSequence !== stepSequence);

  const setVisibleAssignees = (
    stepSequence: number,
    requestAssignees: RequestAssigneeOption[],
    visibleAssignees: RequestAssigneeOption[],
  ) => {
    const visibleAssigneeKeys = new Set(
      visibleAssignees.map((assignee) => assignee.key),
    );
    setStepVisibility((current) => {
      const next = { ...current };
      requestAssignees.forEach((assignee) => {
        if (assignee.stepSequence === stepSequence) {
          return;
        }
        next[
          getAssigneeVisibilityKey(
            stepSequence,
            assignee.stepSequence,
            assignee.assigneeIndex,
          )
        ] = visibleAssigneeKeys.has(assignee.key);
      });
      return next;
    });
  };

  const getDisplayStep = (step: EditableApprovalStep): ApprovalStep => ({
    ...step,
    assignees: step.assignees.map((assignee) => {
      if (assignee.type === AssigneeType.Employee) {
        const employee = stores.employeeStore.employees.find(
          (item) => item.globalId === assignee.employeeGlobalId,
        );
        return {
          ...assignee,
          displayName: assignee.displayName ?? employee?.displayName,
          email: assignee.email ?? employee?.email,
        };
      }

      if (assignee.type === AssigneeType.Team) {
        const team = stores.teamStore.teams.find(
          (item) => item.globalId === assignee.teamGlobalId,
        );
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
      getRequestAssignees().map((assignee) => ({
        stepSequence: step.sequence,
        assigneeStepSequence: assignee.stepSequence,
        assigneeIndex: assignee.assigneeIndex,
        isVisible: step.sequence === assignee.stepSequence ||
          getStepVisibilityValue(
            step.sequence,
            assignee.stepSequence,
            assignee.assigneeIndex,
          ),
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
    });
  };

  const handleSubmit = () => {
    const currentTenant = stores.tenantStore.currentTenant;
    const firstName = currentTenant?.type === TenantType.Business
      ? currentTenant.currentEmployeeFirstName
      : stores.userProfileStore.profile?.firstName;
    const lastName = currentTenant?.type === TenantType.Business
      ? currentTenant.currentEmployeeLastName
      : stores.userProfileStore.profile?.lastName;
    if (!firstName?.trim() || !lastName?.trim()) {
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
    setSubmitPage("visibility");
  };

  const requestAssignees = getRequestAssignees();
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
      toDraftRequestFile(
        file,
        existingFiles.length + index,
        isRevision
          ? ApprovalRequestFileRevisionAction.Added
          : ApprovalRequestFileRevisionAction.Unchanged,
      ),
    ),
  ];

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
      <Box component="form" onSubmit={handleComposeSubmit}>
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
            canUseEmployees={canUseEmployees}
            canUseTeams={canUseTeams}
            employees={stores.employeeStore.employees}
            teams={stores.teamStore.teams}
            onAddAssignee={addAssignee}
            onAddStep={addStep}
            onMoveStep={moveStep}
            onRemoveAssignee={removeAssignee}
            onRemoveStep={removeStep}
            onUpdateAssignee={updateAssignee}
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
          {steps.length >= 2 ? (
            <Button type="submit" endIcon={<ArrowForward />}>
              Steps visibility
            </Button>
          ) : (
            <LoadingButton loading={submitAction.isRunning} type="submit" variant="outlined">
              Submit
            </LoadingButton>
          )}
        </Stack>
      </Box>
      )}
      {submitPage === "visibility" && (
        <>
          <Stack spacing={Dialogs.formStackSpacing} sx={Dialogs.tabContentSx}>
            <Stack spacing={Dialogs.stepStackSpacing}>
              <Box sx={visibilitySummarySx}>
                <ApprovalRequestSummary
                  title={title}
                  description={description}
                  requestFiles={draftRequestFiles}
                  showRevision={false}
                />
              </Box>
              {steps.map((step) => {
                const additionalViewerOptions = getAdditionalViewerOptions(
                  step.sequence,
                  requestAssignees,
                );
                const visibleAssignees = getVisibleAssignees(
                  step.sequence,
                  additionalViewerOptions,
                );
                return (
                  <ApprovalStepBlock
                    key={step.sequence}
                    showEmptyTeamTasksMessage={false}
                    showVisibility={false}
                    step={getDisplayStep(step)}
                    tasks={[]}
                    footerContent={(
                      <Autocomplete
                        multiple
                        options={additionalViewerOptions}
                        value={visibleAssignees}
                        getOptionLabel={(option) => `${option.label} (Step ${option.stepSequence})`}
                        isOptionEqualToValue={(option, value) => option.key === value.key}
                        disableCloseOnSelect
                        onChange={(_, value) =>
                          setVisibleAssignees(
                            step.sequence,
                            additionalViewerOptions,
                            value,
                          )
                        }
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => (
                            <Chip
                              icon={getAssigneeIcon(option.type)}
                              label={option.label}
                              {...getTagProps({ index })}
                            />
                          ))
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Also visible to"
                            helperText="Selected assignees can view this step in addition to its own assignees."
                          />
                        )}
                        renderOption={(props, option) => (
                          <li {...props}>
                            <Stack sx={visibilityOptionSx}>
                              <Typography variant="body2">
                                {option.label}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Step {option.stepSequence}
                              </Typography>
                            </Stack>
                          </li>
                        )}
                      />
                    )}
                  />
                );
              })}
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
            <LoadingButton loading={submitAction.isRunning} variant="outlined" onClick={handleSubmit}>
              Submit
            </LoadingButton>
          </Stack>
        </>
      )}
      <ConfirmationDialog
        cancelFirst
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
    </>
  );
};

export default observer(ApprovalRequestSubmit);
