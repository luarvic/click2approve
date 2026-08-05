import { stores } from "@/app/rootStore";
import {
  resubmitApprovalRequest,
  submitApprovalRequest,
} from "@/features/approvalRequests/api/approvalRequestsApi";
import ApprovalRequestFilesList, {
  RevisionExistingFile,
} from "@/features/approvalRequests/components/ApprovalRequestFilesList";
import {
  getApprovalRecipientIcon,
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
  ApprovalRecipientType,
  ApprovalStep,
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

interface RequestApproverOption {
  approverIndex: number;
  key: string;
  label: string;
  stepSequence: number;
  type: ApprovalRecipientType;
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
  const submitAction = useAsyncAction(ActionLoaders.approvalRequests.submit());
  const initialTemplateHasBeenApplied = useRef(false);

  const tenantGlobalId = stores.tenantStore.currentTenantGlobalId;
  const outboxPath = tenantGlobalId ? Routes.tenantPath(tenantGlobalId, "/outbox") : "/";
  const businessTenantIsSelected =
    stores.tenantStore.currentTenant?.type === TenantType.Business;
  const canUseEmployees =
    businessTenantIsSelected && stores.productStore.employeeApproversAreEnabled;
  const canUseTeams =
    businessTenantIsSelected && stores.productStore.teamApproversAreEnabled;
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

  const getRequestApprovers = (): RequestApproverOption[] =>
    steps.flatMap((step) =>
      step.approvers.map((approver, approverIndex) => {
        const label = getApproverLabel(approver);
        return {
          approverIndex,
          key: `${step.sequence}:${approverIndex}`,
          label,
          stepSequence: step.sequence,
          type: approver.type,
        };
      }),
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

  const getVisibleApprovers = (
    stepSequence: number,
    requestApprovers: RequestApproverOption[],
  ) =>
    requestApprovers.filter(
      (approver) =>
        stepSequence === approver.stepSequence ||
        getStepVisibilityValue(
          stepSequence,
          approver.stepSequence,
          approver.approverIndex,
        ),
    );

  const getAdditionalViewerOptions = (
    stepSequence: number,
    requestApprovers: RequestApproverOption[],
  ) => requestApprovers.filter((approver) => approver.stepSequence !== stepSequence);

  const setVisibleApprovers = (
    stepSequence: number,
    requestApprovers: RequestApproverOption[],
    visibleApprovers: RequestApproverOption[],
  ) => {
    const visibleApproverKeys = new Set(
      visibleApprovers.map((approver) => approver.key),
    );
    setStepVisibility((current) => {
      const next = { ...current };
      requestApprovers.forEach((approver) => {
        if (approver.stepSequence === stepSequence) {
          return;
        }
        next[
          getApproverVisibilityKey(
            stepSequence,
            approver.stepSequence,
            approver.approverIndex,
          )
        ] = visibleApproverKeys.has(approver.key);
      });
      return next;
    });
  };

  const getDisplayStep = (step: EditableApprovalStep): ApprovalStep => ({
    ...step,
    approvers: step.approvers.map((approver) => {
      if (approver.type === ApprovalRecipientType.Employee) {
        const employee = stores.employeeStore.employees.find(
          (item) => item.globalId === approver.employeeGlobalId,
        );
        return {
          ...approver,
          displayName: approver.displayName ?? employee?.displayName,
          email: approver.email ?? employee?.email,
        };
      }

      if (approver.type === ApprovalRecipientType.Team) {
        const team = stores.teamStore.teams.find(
          (item) => item.globalId === approver.teamGlobalId,
        );
        return {
          ...approver,
          displayName: approver.displayName ?? team?.name,
        };
      }

      return approver;
    }),
  });

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

  const requestApprovers = getRequestApprovers();
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
                  requestApprovers,
                );
                const visibleApprovers = getVisibleApprovers(
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
                        value={visibleApprovers}
                        getOptionLabel={(option) => `${option.label} (Step ${option.stepSequence})`}
                        isOptionEqualToValue={(option, value) => option.key === value.key}
                        disableCloseOnSelect
                        onChange={(_, value) =>
                          setVisibleApprovers(
                            step.sequence,
                            additionalViewerOptions,
                            value,
                          )
                        }
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => (
                            <Chip
                              icon={getApprovalRecipientIcon(option.type)}
                              label={option.label}
                              {...getTagProps({ index })}
                            />
                          ))
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Also visible to"
                            helperText="Selected approvers can view this step in addition to its own approvers."
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
    </>
  );
};

export default observer(ApprovalRequestSubmit);
