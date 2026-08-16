import { stores } from "@/app/rootStore";
import { resubmitApprovalRequest, submitApprovalRequest } from "@/features/approvalRequests/api/approvalRequestsApi";
import ApprovalRequestDetailsCard from "@/features/approvalRequests/components/ApprovalRequestDetailsCard";
import ApprovalRequestFilesList, {
  RevisionExistingFile,
} from "@/features/approvalRequests/components/ApprovalRequestFilesList";
import ApprovalRequestParticipantLabel from "@/features/approvalRequests/components/ApprovalRequestParticipantLabel";
import ApprovalRequestParticipantLine, {
  getAssigneeIcon,
} from "@/features/approvalRequests/components/ApprovalRequestParticipantLine";
import ApprovalRequestSummary from "@/features/approvalRequests/components/ApprovalRequestSummary";
import {
  ApprovalRequestFile,
  ApprovalRequestFileRevisionAction,
  ApprovalRequestFileSubmission,
  ApprovalRequestStepVisibilitySubmission,
} from "@/features/approvalRequests/models/approvalRequest";
import { getIncompleteParticipantNameWarning } from "@/features/approvalRequests/utils/incompleteParticipantNameWarning";
import ApprovalStepBlock, { ApprovalStepLabel } from "@/features/approvalWorkflow/components/ApprovalStepBlock";
import ApprovalStepEditor from "@/features/approvalWorkflow/components/ApprovalStepEditor";
import {
  ApprovalStep,
  ApprovalStepAssignee,
  ApprovalStepVisibilityMode,
  AssigneeType,
} from "@/features/approvalWorkflow/models/approvalStep";
import {
  createEditableSteps,
  createEmptyAssignee,
  createEmptyStep,
  EditableApprovalStep,
  toApprovalStepSubmissions,
} from "@/features/approvalWorkflow/models/editableApprovalStep";
import { TenantType } from "@/features/tenants/models/tenant";
import { deleteUserFile, uploadUserFiles } from "@/features/userFiles/api/userFilesApi";
import { UserFile } from "@/features/userFiles/models/userFile";
import ConfirmationDialog from "@/shared/components/dialogs/ConfirmationDialog";
import DisplayName from "@/shared/components/identity/DisplayName";
import CloseOnEscape from "@/shared/components/navigation/CloseOnEscape";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import { Dialogs, Files, Routes } from "@/shared/constants/constants";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
import { notification } from "@/shared/utils/notifications";
import {
  PersistenceSuccessMessages,
  showPersistenceSuccessNotification,
} from "@/shared/utils/persistenceNotifications";
import { AccountTreeOutlined, Add, ArrowBack, ArrowForward, AttachFile } from "@mui/icons-material";
import LoadingButton from "@mui/lab/LoadingButton";
import type { SxProps } from "@mui/material";
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { observer } from "mobx-react-lite";
import { ChangeEvent, useEffect, useRef, useState } from "react";

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

interface RequestAssigneeOption {
  assigneeIndex: number;
  key: string;
  label: string;
  stepSequence: number;
  type: AssigneeType;
}

type StepVisibilityMode = "all" | "allExcept" | "selected" | "assignees";

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

const getAssigneeVisibilityKey = (stepSequence: number, assigneeStepSequence: number, assigneeIndex: number) =>
  `${stepSequence}:${assigneeStepSequence}:${assigneeIndex}`;

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

      stepVisibility[getAssigneeVisibilityKey(step.sequence, assigneeStep.sequence, assigneeIndex)] =
        visibility.isVisible;
    });
  });

  return { stepVisibility, stepVisibilityModes };
};

const visibilityModeOptions: {
  label: string;
  value: StepVisibilityMode;
}[] = [
  {
    label: "All participants",
    value: "all",
  },
  {
    label: "All participants except selected",
    value: "allExcept",
  },
  {
    label: "Assignees and selected participants",
    value: "selected",
  },
  {
    label: "Assignees only",
    value: "assignees",
  },
];

const visibilityStepContentSx: SxProps<Theme> = { pr: 0 };
const visibilityStepLabelSx: SxProps<Theme> = {
  "& .MuiStepLabel-label, & .MuiStepLabel-label.Mui-active, & .MuiStepLabel-label.Mui-completed": {
    color: "text.primary",
  },
};
const visibilityToggleButtonGroupSx: SxProps<Theme> = {
  display: { xs: "none", sm: "flex" },
  "& .MuiToggleButton-root": {
    flex: 1,
    textTransform: "none",
    typography: "body2",
  },
};
const visibilityMobileModeOptionsSx: SxProps<Theme> = {
  alignItems: "flex-start",
  display: { sm: "none", xs: "flex" },
  flexDirection: "column",
};
const visibilityMobileModeOptionSx: SxProps<Theme> = {
  alignItems: "center",
};

const VisibilityStepIcon = () => <AccountTreeOutlined color="action" fontSize="small" />;

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
  const fileInput = useRef<HTMLInputElement>(null);
  const replacementFileInput = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(initialDraft?.title ?? "");
  const [newFiles, setNewFiles] = useState<UserFile[]>(initialDraft?.newFiles ?? []);
  const [existingFiles, setExistingFiles] = useState<RevisionExistingFile[]>(initialDraft?.existingFiles ?? []);
  const [steps, setSteps] = useState<EditableApprovalStep[]>(initialDraft?.steps ?? []);
  const [description, setDescription] = useState(initialDraft?.description ?? "");
  const [replacementFileIndex, setReplacementFileIndex] = useState<number | null>(null);
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
  ]);

  const handleUploadClick = () => {
    fileInput.current?.click();
  };

  const handleFilesChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = "";
    if (!tenantGlobalId || selectedFiles.length === 0) {
      return;
    }

    const uploadedFiles = await uploadUserFiles(tenantGlobalId, selectedFiles);
    setNewFiles((currentFiles) => [...currentFiles, ...uploadedFiles]);
  };

  const handleReplacementFilesChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (replacementFileIndex !== null && selectedFile && tenantGlobalId) {
      const [replacement] = await uploadUserFiles(tenantGlobalId, [selectedFile]);
      if (!replacement) {
        return;
      }

      setExistingFiles((files) =>
        files.map((file, index) => (index === replacementFileIndex ? { ...file, removed: false, replacement } : file)),
      );
    }
    setReplacementFileIndex(null);
  };

  const removeExistingFile = (index: number) => {
    const fileToRemove = existingFiles[index];
    if (!fileToRemove) {
      return;
    }

    setExistingFiles((files) =>
      isRevision
        ? files.map((file, i) => (i === index ? { ...file, removed: true, replacement: undefined } : file))
        : files.filter((_, i) => i !== index),
    );
  };

  const removeNewFile = async (index: number) => {
    const file = newFiles[index];
    if (!file || !tenantGlobalId) {
      setNewFiles((files) => files.filter((_, fileIndex) => fileIndex !== index));
      return;
    }

    if (await deleteUserFile(tenantGlobalId, file.globalId)) {
      setNewFiles((files) => files.filter((_, fileIndex) => fileIndex !== index));
    }
  };

  const removeReplacementFile = async (index: number) => {
    const replacement = existingFiles[index]?.replacement;
    if (!replacement || !tenantGlobalId) {
      setExistingFiles((files) =>
        files.map((file, fileIndex) => (fileIndex === index ? { ...file, replacement: undefined } : file)),
      );
      return;
    }

    if (await deleteUserFile(tenantGlobalId, replacement.globalId)) {
      setExistingFiles((files) =>
        files.map((file, fileIndex) => (fileIndex === index ? { ...file, replacement: undefined } : file)),
      );
    }
  };

  const cleanUp = () => {
    setTitle("");
    setNewFiles([]);
    setExistingFiles([]);
    setSteps([]);
    setDescription("");
    setReplacementFileIndex(null);
    setStepVisibility({});
    setStepVisibilityModes({});
    stores.approvalRequestStore.setRequestToClone(null);
  };

  const handleClose = () => {
    cleanUp();
    onClose();
  };

  const updateStep = (stepIndex: number, updater: (step: EditableApprovalStep) => EditableApprovalStep) => {
    setSteps((current) => current.map((step, index) => (index === stepIndex ? updater(step) : step)));
  };

  const addStep = () => {
    setSteps((current) => [...current, createEmptyStep(current.length + 1, true, defaultAssigneeType)]);
  };

  const removeStep = (stepIndex: number) => {
    setSteps((current) =>
      current.filter((_, index) => index !== stepIndex).map((step, index) => ({ ...step, sequence: index + 1 })),
    );
  };

  const moveStep = (stepIndex: number, direction: -1 | 1) => {
    const nextIndex = stepIndex + direction;
    setSteps((current) => {
      if (nextIndex < 0 || nextIndex >= current.length) {
        return current;
      }

      const reordered = [...current];
      [reordered[stepIndex], reordered[nextIndex]] = [reordered[nextIndex], reordered[stepIndex]];
      return reordered.map((step, index) => ({ ...step, sequence: index + 1 }));
    });
  };

  const addAssignee = (stepIndex: number) => {
    updateStep(stepIndex, (step) => ({
      ...step,
      assignees: [...step.assignees, createEmptyAssignee(defaultAssigneeType)],
    }));
  };

  const updateAssignee = (stepIndex: number, assigneeIndex: number, assignee: ApprovalStepAssignee) => {
    updateStep(stepIndex, (step) => ({
      ...step,
      assignees: step.assignees.map((item, index) => (index === assigneeIndex ? assignee : item)),
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

  const getRequestAssignees = (): RequestAssigneeOption[] =>
    steps.flatMap((step) =>
      step.assignees.map((assignee, assigneeIndex) => {
        const label = getAssigneeLabel(assignee);
        return {
          assigneeIndex,
          key: getAssigneeOptionKey(assignee),
          label,
          stepSequence: step.sequence,
          type: assignee.type,
        };
      }),
    );

  const getAssigneeOptionKey = (assignee: ApprovalStepAssignee) => {
    switch (assignee.type) {
      case AssigneeType.Employee:
        return `employee:${assignee.employeeGlobalId ?? assignee.displayName ?? ""}`;
      case AssigneeType.Team:
        return `team:${assignee.teamGlobalId ?? assignee.displayName ?? ""}`;
      default:
        return `user:${assignee.email?.trim().toLowerCase() ?? assignee.displayName ?? ""}`;
    }
  };

  const getAssigneeLabel = (assignee: ApprovalStepAssignee) => {
    if (assignee.displayName) {
      return assignee.displayName;
    }
    if (assignee.type === AssigneeType.Employee) {
      return (
        stores.employeeStore.employees.find((employee) => employee.globalId === assignee.employeeGlobalId)
          ?.displayName ?? "Employee"
      );
    }
    if (assignee.type === AssigneeType.Team) {
      return stores.teamStore.teams.find((team) => team.globalId === assignee.teamGlobalId)?.name ?? "Team";
    }
    return assignee.email || "Email";
  };

  const getStepVisibilityValue = (stepSequence: number, assigneeStepSequence: number, assigneeIndex: number) =>
    stepVisibility[getAssigneeVisibilityKey(stepSequence, assigneeStepSequence, assigneeIndex)] ??
    (stepVisibilityModes[stepSequence] ?? "all") === "all";

  const getVisibleAssignees = (stepSequence: number, requestAssignees: RequestAssigneeOption[]) =>
    requestAssignees.filter(
      (assignee) =>
        stepSequence === assignee.stepSequence ||
        getStepVisibilityValue(stepSequence, assignee.stepSequence, assignee.assigneeIndex),
    );

  const getHiddenAssignees = (stepSequence: number, requestAssignees: RequestAssigneeOption[]) =>
    requestAssignees.filter(
      (assignee) =>
        stepSequence !== assignee.stepSequence &&
        !getStepVisibilityValue(stepSequence, assignee.stepSequence, assignee.assigneeIndex),
    );

  const getAdditionalViewerOptions = (stepSequence: number, requestAssignees: RequestAssigneeOption[]) => {
    const optionKeys = new Set<string>();

    return requestAssignees
      .filter((assignee) => assignee.stepSequence !== stepSequence)
      .filter((assignee) => {
        if (optionKeys.has(assignee.key)) {
          return false;
        }

        optionKeys.add(assignee.key);
        return true;
      })
      .sort((first, second) => first.label.localeCompare(second.label));
  };

  const setVisibleAssignees = (
    stepSequence: number,
    requestAssignees: RequestAssigneeOption[],
    visibleAssignees: RequestAssigneeOption[],
  ) => {
    const visibleAssigneeKeys = new Set(visibleAssignees.map((assignee) => assignee.key));
    setStepVisibility((current) => {
      const next = { ...current };
      requestAssignees.forEach((assignee) => {
        if (assignee.stepSequence === stepSequence) {
          return;
        }
        next[getAssigneeVisibilityKey(stepSequence, assignee.stepSequence, assignee.assigneeIndex)] =
          visibleAssigneeKeys.has(assignee.key);
      });
      return next;
    });
  };

  const setVisibilityMode = (
    stepSequence: number,
    mode: StepVisibilityMode,
    additionalViewerOptions: RequestAssigneeOption[],
  ) => {
    setStepVisibilityModes((current) => ({ ...current, [stepSequence]: mode }));
    if (mode === "assignees") {
      setVisibleAssignees(stepSequence, additionalViewerOptions, []);
    }
    if (mode === "all" || mode === "allExcept") {
      setVisibleAssignees(stepSequence, additionalViewerOptions, additionalViewerOptions);
    }
    if (mode === "selected") {
      setVisibleAssignees(stepSequence, additionalViewerOptions, []);
    }
  };

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
      getRequestAssignees().map((assignee) => ({
        stepSequence: step.sequence,
        assigneeStepSequence: assignee.stepSequence,
        assigneeIndex: assignee.assigneeIndex,
        isVisible:
          step.sequence === assignee.stepSequence ||
          getStepVisibilityValue(step.sequence, assignee.stepSequence, assignee.assigneeIndex),
      })),
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
    const currentTenant = stores.tenantStore.currentTenant;
    const firstName =
      currentTenant?.type === TenantType.Business
        ? currentTenant.currentEmployeeFirstName
        : stores.userProfileStore.profile?.firstName;
    const lastName =
      currentTenant?.type === TenantType.Business
        ? currentTenant.currentEmployeeLastName
        : stores.userProfileStore.profile?.lastName;
    if ((!firstName?.trim() || !lastName?.trim()) && currentTenant?.type === TenantType.Business) {
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
        <Box component="form" onSubmit={handleComposeSubmit}>
          <Stack spacing={Dialogs.formStackSpacing} sx={Dialogs.tabContentSx}>
            <ApprovalRequestDetailsCard ariaLabel="Request details" mode="edit" showStatusBorder={false}>
              <Stack spacing={Dialogs.formStackSpacing}>
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
                  onRemoveNew={(index) => void removeNewFile(index)}
                  onRemoveReplacement={(index) => void removeReplacementFile(index)}
                  onRestoreExisting={(index) =>
                    setExistingFiles((files) =>
                      files.map((file, i) => (i === index ? { ...file, removed: false } : file)),
                    )
                  }
                  onReplaceExisting={
                    isRevision
                      ? (index) => {
                          setReplacementFileIndex(index);
                          replacementFileInput.current?.click();
                        }
                      : undefined
                  }
                />
                <Box sx={Dialogs.bottomSpacingSx}>
                  <Button startIcon={<AttachFile />} onClick={handleUploadClick}>
                    Attach files
                  </Button>
                  <input
                    name="approval-request-files"
                    type="file"
                    multiple
                    onChange={handleFilesChange}
                    ref={fileInput}
                    style={Files.inputStyle}
                  />
                  <input
                    name="approval-request-replacement-file"
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
              </Stack>
            </ApprovalRequestDetailsCard>
            <Stack spacing={Dialogs.formStackSpacing}>
              <ApprovalStepEditor
                steps={steps}
                canUseEmployees={canUseEmployees}
                canUseTeams={canUseTeams}
                compactEmployeeOptions
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
                stackAssigneeControlsOnSmallScreens
              />
              <Box sx={Dialogs.textBottomSpacingSx}>
                <Button startIcon={<Add />} onClick={addStep}>
                  Add step
                </Button>
              </Box>
            </Stack>
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
                Next
              </Button>
            ) : (
              <LoadingButton loading={submitAction.isRunning} type="submit" variant="outlined">
                Submit
              </LoadingButton>
            )}
          </Stack>
        </Box>
      )}
      {isVisibilityPage && (
        <>
          <Stack spacing={Dialogs.formStackSpacing} sx={Dialogs.tabContentSx}>
            <Stack spacing={Dialogs.stepStackSpacing}>
              <ApprovalRequestDetailsCard ariaLabel="Request summary" mode="edit" showStatusBorder={false}>
                <ApprovalRequestSummary
                  title={title}
                  description={description}
                  requestFiles={draftRequestFiles}
                  showRevision={false}
                />
              </ApprovalRequestDetailsCard>
              <Stepper activeStep={-1} nonLinear orientation="vertical">
                {steps.map((step) => {
                  const additionalViewerOptions = getAdditionalViewerOptions(step.sequence, requestAssignees);
                  const visibleAssignees = getVisibleAssignees(step.sequence, additionalViewerOptions);
                  const hiddenAssignees = getHiddenAssignees(step.sequence, additionalViewerOptions);
                  const visibilityMode = stepVisibilityModes[step.sequence] ?? "all";
                  return (
                    <Step expanded key={step.sequence}>
                      <StepLabel StepIconComponent={VisibilityStepIcon} sx={visibilityStepLabelSx}>
                        <ApprovalStepLabel showVisibility={false} step={getDisplayStep(step)} />
                      </StepLabel>
                      <StepContent sx={visibilityStepContentSx} TransitionProps={{ in: true, unmountOnExit: false }}>
                        <ApprovalStepBlock
                          setupFutureTasks
                          showMetadata={false}
                          showStepBox={false}
                          showStepTitle={false}
                          step={getDisplayStep(step)}
                          tasks={[]}
                          footerContent={
                            <Stack spacing={Dialogs.stepHeaderSpacing}>
                              <ApprovalRequestParticipantLabel>Visibility</ApprovalRequestParticipantLabel>
                              <RadioGroup
                                aria-label="Visibility"
                                row={false}
                                sx={visibilityMobileModeOptionsSx}
                                value={visibilityMode}
                                onChange={(event) =>
                                  setVisibilityMode(
                                    step.sequence,
                                    event.target.value as StepVisibilityMode,
                                    additionalViewerOptions,
                                  )
                                }
                              >
                                {visibilityModeOptions.map((option) => (
                                  <FormControlLabel
                                    control={<Radio />}
                                    key={option.value}
                                    label={<Typography variant="body2">{option.label}</Typography>}
                                    sx={visibilityMobileModeOptionSx}
                                    value={option.value}
                                  />
                                ))}
                              </RadioGroup>
                              <ToggleButtonGroup
                                exclusive
                                sx={visibilityToggleButtonGroupSx}
                                value={visibilityMode}
                                onChange={(_, value: StepVisibilityMode | null) => {
                                  if (value) {
                                    setVisibilityMode(step.sequence, value, additionalViewerOptions);
                                  }
                                }}
                              >
                                {visibilityModeOptions.map((option) => (
                                  <ToggleButton key={option.value} value={option.value}>
                                    {option.label}
                                  </ToggleButton>
                                ))}
                              </ToggleButtonGroup>
                              {(visibilityMode === "selected" || visibilityMode === "allExcept") && (
                                <Autocomplete
                                  multiple
                                  filterSelectedOptions
                                  options={additionalViewerOptions}
                                  value={visibilityMode === "selected" ? visibleAssignees : hiddenAssignees}
                                  getOptionLabel={(option) => `${option.label} (Step ${option.stepSequence})`}
                                  isOptionEqualToValue={(option, value) => option.key === value.key}
                                  disableCloseOnSelect
                                  onChange={(_, value) => {
                                    setVisibleAssignees(
                                      step.sequence,
                                      additionalViewerOptions,
                                      visibilityMode === "selected"
                                        ? value
                                        : additionalViewerOptions.filter(
                                            (option) => !value.some((excluded) => excluded.key === option.key),
                                          ),
                                    );
                                  }}
                                  renderTags={(value, getTagProps) =>
                                    value.map((option, index) => (
                                      <Chip
                                        {...getTagProps({ index })}
                                        icon={getAssigneeIcon(option.type)}
                                        label={option.label}
                                      />
                                    ))
                                  }
                                  renderInput={(params) => (
                                    <TextField
                                      {...params}
                                      label={
                                        visibilityMode === "selected"
                                          ? "Additional participants who can view this step"
                                          : "Participants who cannot view this step"
                                      }
                                    />
                                  )}
                                  renderOption={(props, option) => (
                                    <li {...props}>
                                      <ApprovalRequestParticipantLine
                                        label={<DisplayName displayName={option.label} showEmailAddress={false} />}
                                        type={option.type}
                                      />
                                    </li>
                                  )}
                                />
                              )}
                            </Stack>
                          }
                        />
                      </StepContent>
                    </Step>
                  );
                })}
              </Stepper>
            </Stack>
          </Stack>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={Dialogs.stepHeaderSpacing}
            sx={Dialogs.addStepButtonSx}
          >
            <Button startIcon={<ArrowBack />} onClick={() => onShowCompose(createDraft())}>
              BACK
            </Button>
            <LoadingButton loading={submitAction.isRunning} variant="outlined" onClick={handleSubmit}>
              Submit
            </LoadingButton>
          </Stack>
        </>
      )}
      {nameWarning && (
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
      )}
    </CloseOnEscape>
  );
};

export default observer(ApprovalRequestSubmit);
