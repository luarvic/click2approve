import { stores } from "@/app/rootStore";
import { submitApprovalRequest } from "@/features/approvalRequests/api/approvalRequestsApi";
import ApprovalRequestFilesList from "@/features/approvalRequests/components/ApprovalRequestFilesList";
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
import { UserFile } from "@/features/userFiles/models/userFile";
import { Dialogs, Files, Pages } from "@/shared/constants/constants";
import { validateEmails } from "@/shared/utils/validators";
import { Add, AttachFile } from "@mui/icons-material";
import {
  Box,
  Button,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { observer } from "mobx-react-lite";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

interface ApprovalRequestSubmitProps {
  initialTemplateId?: number;
  onClose: (currentApprovalRequestId?: number) => void;
}

const ApprovalRequestSubmit: React.FC<ApprovalRequestSubmitProps> = ({
  initialTemplateId,
  onClose,
}) => {
  const fileInput = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [existingFiles, setExistingFiles] = useState<UserFile[]>([]);
  const [steps, setSteps] = useState<EditableApprovalStep[]>([]);
  const [description, setDescription] = useState("");
  const initialTemplateHasBeenApplied = useRef(false);

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

  useEffect(() => {
    if (requestToClone) {
      setTitle(requestToClone.title);
      setExistingFiles(requestToClone.userFiles);
      setSteps(createEditableSteps(requestToClone.steps));
      setDescription(requestToClone.description ?? "");
    }

    if (tenantId && businessTenantIsSelected) {
      if (canUseEmployees) {
        stores.employeeStore.load(tenantId);
      }
      if (canUseTeams) {
        stores.teamStore.load(tenantId);
      }
      if (canUseTemplates) {
        void stores.approvalStepTemplateStore.load(tenantId).then(() => {
          if (initialTemplateHasBeenApplied.current || !initialTemplateId) {
            return;
          }

          const template = stores.approvalStepTemplateStore.templates.find(
            (item) => item.id === initialTemplateId,
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
    tenantId,
    businessTenantIsSelected,
    canUseEmployees,
    canUseTeams,
    canUseTemplates,
    initialTemplateId,
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
    setSteps([]);
    setDescription("");
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
      createEmptyStep(current.length + 1, false),
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
    if (!tenantId) {
      return;
    }

    const uploadedFiles = await uploadUserFiles(tenantId, newFiles);
    if (uploadedFiles.length !== newFiles.length) {
      toast.error("One or more files could not be uploaded.");
      return;
    }

    const approvalRequestId = await submitApprovalRequest(
      tenantId,
      trimmedTitle,
      [...existingFiles, ...uploadedFiles],
      toApprovalStepSubmissions(steps),
      description,
    );
    if (approvalRequestId) {
      toast.success("The request was successfully sent");
      cleanUp();
      stores.approvalRequestStore.clear();
      const [, createdRequest] = await Promise.all([
        stores.approvalRequestStore.load(tenantId),
        stores.approvalRequestStore.loadDetails(tenantId, approvalRequestId),
      ]);
      stores.approvalRequestStore.setCurrent(createdRequest ?? null);
      stores.approvalRequestTaskStore.loadUncompletedCount(tenantId);
      onClose(createdRequest?.id);
    }
  };

  return (
    <>
      <Typography component="h1" variant="h5" sx={Pages.titleSx}>
        {requestToClone ? "Clone approval request" : "New approval request"}
      </Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={Dialogs.formStackSpacing} sx={Dialogs.tabContentSx}>
            <TextField
              autoFocus
              margin="normal"
              fullWidth
              label="Title"
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
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
          <Button type="submit" variant="outlined">
            Submit
          </Button>
        </Stack>
      </Box>
    </>
  );
};

export default observer(ApprovalRequestSubmit);
