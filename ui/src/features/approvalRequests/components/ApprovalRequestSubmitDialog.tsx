import { stores } from "@/app/stores";
import { submitApprovalRequest } from "@/features/approvalRequests/api/approvalRequestApi";
import ApprovalRequestFilesList from "@/features/approvalRequests/components/ApprovalRequestFilesList";
import ApprovalStepApproverRow from "@/features/approvalWorkflow/components/ApprovalStepApproverRow";
import {
  ApprovalRecipientType,
  ApprovalStep,
  ApprovalStepApprover,
  ApprovalStepMode,
} from "@/features/approvalWorkflow/models/approvalStep";
import { TenantType } from "@/features/tenants/models/tenant";
import { uploadUserFiles } from "@/features/userFiles/api/userFileApi";
import { UserFile } from "@/features/userFiles/models/userFile";
import { Dialogs, Files, StackSpacing } from "@/shared/constants/constants";
import { validateEmails } from "@/shared/utils/validators";
import {
  Add,
  AttachFile,
  ContentCopy,
  DeleteOutline,
  KeyboardArrowDown,
  KeyboardArrowUp,
  Save,
} from "@mui/icons-material";
import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  LocalizationProvider,
  MobileDateTimePicker,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { observer } from "mobx-react-lite";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

const emptyApprover = (): ApprovalStepApprover => ({
  type: ApprovalRecipientType.Email,
  email: "",
  canViewRequest: true,
});

const emptyStep = (sequence: number): ApprovalStep => ({
  sequence,
  mode: ApprovalStepMode.Any,
  approvers: [emptyApprover()],
});

const cloneSteps = (steps: ApprovalStep[]) =>
  steps.map((step, index) => ({
    sequence: index + 1,
    mode: step.mode,
    approvers: step.approvers.map((approver) => ({
      type: approver.type,
      email: approver.email,
      employeeId: approver.employeeId,
      teamId: approver.teamId,
      displayName: approver.displayName,
      canViewRequest: approver.canViewRequest,
    })),
  }));

const ApprovalRequestSubmitDialog = () => {
  const fileInput = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [existingFiles, setExistingFiles] = useState<UserFile[]>([]);
  const [steps, setSteps] = useState<ApprovalStep[]>([emptyStep(1)]);
  const [approveBy, setApproveBy] = useState<Dayjs | null>(null);
  const [comment, setComment] = useState("");
  const [includeCloneLink, setIncludeCloneLink] = useState(true);
  const [templateName, setTemplateName] = useState("");

  const tenantId = stores.tenantStore.currentTenantId;
  const businessTenantIsSelected =
    stores.tenantStore.currentTenant?.type === TenantType.Business;
  const canUseEmployees =
    businessTenantIsSelected && stores.productStore.employeeApproversAreEnabled;
  const canUseTeams =
    businessTenantIsSelected && stores.productStore.teamApproversAreEnabled;
  const canUseTemplates =
    businessTenantIsSelected &&
    stores.productStore.approvalStepTemplatesAreEnabled &&
    tenantId !== null;
  const requestToClone = stores.approvalRequestStore.requestToClone;
  const dialogIsOpen = stores.commonStore.approvalRequestSubmitDialogIsOpen;

  useEffect(() => {
    if (!dialogIsOpen) {
      return;
    }

    if (requestToClone) {
      setTitle(requestToClone.title);
      setExistingFiles(requestToClone.userFiles);
      setSteps(cloneSteps(requestToClone.steps));
      setApproveBy(
        requestToClone.approveByDate
          ? dayjs(requestToClone.approveByDate)
          : null,
      );
      setComment(requestToClone.comment ?? "");
      setIncludeCloneLink(true);
    }

    if (tenantId && businessTenantIsSelected) {
      if (canUseEmployees) {
        stores.employeeStore.load(tenantId);
      }
      if (canUseTeams) {
        stores.teamStore.load(tenantId);
      }
      if (canUseTemplates) {
        stores.approvalStepTemplateStore.load(tenantId);
      }
    }
  }, [
    dialogIsOpen,
    requestToClone,
    tenantId,
    businessTenantIsSelected,
    canUseEmployees,
    canUseTeams,
    canUseTemplates,
  ]);

  const handleUploadClick = () => {
    fileInput.current?.click();
  };

  const handleFilesChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.currentTarget.files ?? []);
    setNewFiles((currentFiles) => [...currentFiles, ...selectedFiles]);
    event.currentTarget.value = "";
  };

  const cleanUp = () => {
    setTitle("");
    setNewFiles([]);
    setExistingFiles([]);
    setSteps([emptyStep(1)]);
    setApproveBy(null);
    setComment("");
    setTemplateName("");
    setIncludeCloneLink(true);
    stores.approvalRequestStore.setRequestToClone(null);
  };

  const handleClose = () => {
    stores.commonStore.setApprovalRequestSubmitDialogIsOpen(false);
    cleanUp();
  };

  const updateStep = (
    stepIndex: number,
    updater: (step: ApprovalStep) => ApprovalStep,
  ) => {
    setSteps((current) =>
      current.map((step, index) =>
        index === stepIndex ? updater(step) : step,
      ),
    );
  };

  const addStep = () => {
    setSteps((current) => [...current, emptyStep(current.length + 1)]);
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
      approvers: [...step.approvers, emptyApprover()],
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
      approvers:
        step.approvers.length === 1
          ? step.approvers
          : step.approvers.filter((_, index) => index !== approverIndex),
    }));
  };

  const handleSaveTemplate = async () => {
    if (!canUseTemplates || tenantId === null) {
      return;
    }
    if (!templateName.trim()) {
      toast.error("Template name is required.");
      return;
    }
    if (!validateSteps()) {
      return;
    }

    const didSave = await stores.approvalStepTemplateStore.create(tenantId, {
      name: templateName.trim(),
      steps,
    });
    if (didSave) {
      toast.success("Template saved.");
      setTemplateName("");
    }
  };

  const validateSteps = () => {
    const emails = steps.flatMap((step) =>
      step.approvers
        .filter((approver) => approver.type === ApprovalRecipientType.Email)
        .map((approver) => approver.email ?? ""),
    );
    const hasMissingRecipient = steps.some((step) =>
      step.approvers.some((approver) => {
        if (approver.type === ApprovalRecipientType.Email) {
          return !approver.email?.trim();
        }
        if (approver.type === ApprovalRecipientType.Employee) {
          return !approver.employeeId;
        }
        return !approver.teamId;
      }),
    );

    if (hasMissingRecipient || (emails.length > 0 && !validateEmails(emails))) {
      toast.error("Specify valid approvers for every step.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      toast.error("Title is required.");
      return;
    }
    if (newFiles.length === 0 && existingFiles.length === 0) {
      toast.error("Add one or more files.");
      return;
    }
    if (!validateSteps()) {
      return;
    }

    const uploadedFiles = await uploadUserFiles(newFiles);
    if (uploadedFiles.length !== newFiles.length) {
      toast.error("One or more files could not be uploaded.");
      return;
    }

    const didSubmit = await submitApprovalRequest(
      trimmedTitle,
      [...existingFiles, ...uploadedFiles],
      steps,
      approveBy ? approveBy.toDate() : null,
      comment,
      includeCloneLink ? requestToClone?.id : undefined,
    );
    if (didSubmit) {
      stores.commonStore.setApprovalRequestSubmitDialogIsOpen(false);
      toast.success("The request was successfully sent");
      cleanUp();
      stores.approvalRequestStore.clear();
      stores.approvalRequestStore.load();
      stores.approvalRequestTaskStore.loadUncompletedCount();
    }
  };

  return (
    <Dialog
      open={stores.commonStore.approvalRequestSubmitDialogIsOpen}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      PaperProps={{ component: "form", onSubmit: handleSubmit }}
    >
      <DialogTitle>
        {requestToClone ? "Clone approval request" : "New approval request"}
      </DialogTitle>
      <DialogContent>
        {requestToClone && (
          <Stack
            direction="row"
            spacing={StackSpacing.default}
            alignItems="center"
            sx={Dialogs.textBottomSpacingSx}
          >
            <ContentCopy fontSize="small" />
            <Typography variant="body2">
              Link to "{requestToClone.title}"
            </Typography>
            <Switch
              checked={includeCloneLink}
              onChange={(_, checked) => setIncludeCloneLink(checked)}
            />
          </Stack>
        )}
        <TextField
          autoFocus
          margin="normal"
          fullWidth
          label="Title"
          variant="standard"
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
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
        </Box>
        <ApprovalRequestFilesList
          existingFiles={existingFiles}
          newFiles={newFiles}
          onRemoveExisting={(index) =>
            setExistingFiles((files) => files.filter((_, i) => i !== index))
          }
          onRemoveNew={(index) =>
            setNewFiles((files) => files.filter((_, i) => i !== index))
          }
        />
        {canUseTemplates && (
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={StackSpacing.default}
            sx={Dialogs.textBottomSpacingSx}
          >
            <Autocomplete
              fullWidth
              options={stores.approvalStepTemplateStore.templates}
              getOptionLabel={(option) => option.name}
              renderInput={(params) => (
                <TextField {...params} label="Populate from template" />
              )}
              onChange={(_, value) => {
                if (value) {
                  setSteps(cloneSteps(value.steps));
                }
              }}
            />
            <TextField
              label="Template name"
              value={templateName}
              onChange={(event) => setTemplateName(event.target.value)}
            />
            <Button startIcon={<Save />} onClick={handleSaveTemplate}>
              Save
            </Button>
          </Stack>
        )}
        <Stack spacing={Dialogs.stepStackSpacing}>
          {steps.map((step, stepIndex) => (
            <Box key={step.sequence} sx={Dialogs.approvalStepSx}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={Dialogs.stepHeaderSpacing}
                alignItems={{ xs: "stretch", sm: "center" }}
                sx={Dialogs.stepHeaderSx}
              >
                <Typography variant="subtitle1" sx={Dialogs.stepTitleSx}>
                  Step {step.sequence}
                </Typography>
                <ToggleButtonGroup
                  exclusive
                  size="small"
                  value={step.mode}
                  onChange={(_, value) => {
                    if (value !== null) {
                      updateStep(stepIndex, (current) => ({
                        ...current,
                        mode: value,
                      }));
                    }
                  }}
                >
                  <ToggleButton value={ApprovalStepMode.Any}>Any</ToggleButton>
                  <ToggleButton value={ApprovalStepMode.All}>All</ToggleButton>
                </ToggleButtonGroup>
                <Stack direction="row" spacing={Dialogs.stepActionSpacing}>
                  <Tooltip title="Move step up">
                    <span>
                      <IconButton
                        disabled={stepIndex === 0}
                        onClick={() => moveStep(stepIndex, -1)}
                      >
                        <KeyboardArrowUp />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Move step down">
                    <span>
                      <IconButton
                        disabled={stepIndex === steps.length - 1}
                        onClick={() => moveStep(stepIndex, 1)}
                      >
                        <KeyboardArrowDown />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Stack>
                <Tooltip title="Remove step">
                  <span>
                    <IconButton
                      aria-label={`Remove step ${step.sequence}`}
                      disabled={steps.length === 1}
                      onClick={() => removeStep(stepIndex)}
                    >
                      <DeleteOutline />
                    </IconButton>
                  </span>
                </Tooltip>
              </Stack>
              <Stack spacing={Dialogs.approverStackSpacing}>
                {step.approvers.map((approver, approverIndex) => (
                  <ApprovalStepApproverRow
                    key={approverIndex}
                    approver={approver}
                    canUseEmployees={canUseEmployees}
                    canUseTeams={canUseTeams}
                    employees={stores.employeeStore.employees}
                    teams={stores.teamStore.teams}
                    onChange={(nextApprover) =>
                      updateApprover(stepIndex, approverIndex, nextApprover)
                    }
                    onRemove={() => removeApprover(stepIndex, approverIndex)}
                  />
                ))}
              </Stack>
              <Button
                startIcon={<Add />}
                onClick={() => addApprover(stepIndex)}
              >
                Add approver
              </Button>
            </Box>
          ))}
        </Stack>
        <Button
          startIcon={<Add />}
          onClick={addStep}
          sx={Dialogs.addStepButtonSx}
        >
          Add step
        </Button>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <MobileDateTimePicker
            slotProps={{
              textField: {
                fullWidth: true,
                variant: "standard",
                required: false,
                margin: "normal",
              },
            }}
            label="Review by"
            value={approveBy}
            onChange={(newValue) => setApproveBy(newValue)}
          />
        </LocalizationProvider>
        <TextField
          margin="normal"
          fullWidth
          label="Comment"
          variant="standard"
          multiline
          rows={Dialogs.commentTextFieldRows}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button type="submit">Submit</Button>
      </DialogActions>
    </Dialog>
  );
};

export default observer(ApprovalRequestSubmitDialog);
