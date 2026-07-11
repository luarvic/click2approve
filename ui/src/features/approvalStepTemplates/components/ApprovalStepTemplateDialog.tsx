import { stores } from "@/app/rootStore";
import { ApprovalStepTemplate } from "@/features/approvalStepTemplates/models/approvalStepTemplate";
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
import DeleteConfirmationDialog from "@/shared/components/dialogs/DeleteConfirmationDialog";
import { Dialogs, Pages } from "@/shared/constants/constants";
import { validateEmails } from "@/shared/utils/validators";
import { Button, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface ApprovalStepTemplateEditorProps {
  template: ApprovalStepTemplate | null;
  onClose: (currentTemplateId?: number) => void;
  onDelete: (templateId: number) => Promise<boolean>;
}

const ApprovalStepTemplateEditor: React.FC<ApprovalStepTemplateEditorProps> = ({
  template,
  onClose,
  onDelete,
}) => {
  const [name, setName] = useState("");
  const [deleteDialogIsOpen, setDeleteDialogIsOpen] = useState(false);
  const [steps, setSteps] = useState<EditableApprovalStep[]>([
    createEmptyStep(1),
  ]);
  const tenantId = stores.tenantStore.currentTenantId;
  const businessTenantIsSelected =
    stores.tenantStore.currentTenant?.type === TenantType.Business;
  const canUseEmployees =
    businessTenantIsSelected && stores.productStore.employeeApproversAreEnabled;
  const canUseTeams =
    businessTenantIsSelected && stores.productStore.teamApproversAreEnabled;

  useEffect(() => {
    setName(template?.name ?? "");
    setSteps(
      template ? createEditableSteps(template.steps) : [createEmptyStep(1)],
    );
    if (tenantId && businessTenantIsSelected) {
      if (canUseEmployees) {
        stores.employeeStore.load(tenantId);
      }
      if (canUseTeams) {
        stores.teamStore.load(tenantId);
      }
    }
  }, [
    template,
    tenantId,
    businessTenantIsSelected,
    canUseEmployees,
    canUseTeams,
  ]);

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

  const handleSubmit = async () => {
    if (!tenantId) {
      return;
    }
    if (!name.trim()) {
      toast.error("Template name is required.");
      return;
    }
    if (!validateSteps()) {
      return;
    }

    const saved = template
      ? await stores.approvalStepTemplateStore.update(tenantId, template.id, {
        name: name.trim(),
        steps: toApprovalStepSubmissions(steps),
      })
      : await stores.approvalStepTemplateStore.create(tenantId, {
        name: name.trim(),
        steps: toApprovalStepSubmissions(steps),
      });
    if (saved) {
      onClose(saved.id);
    }
  };

  return (
    <>
      <Typography component="h1" variant="h5" sx={Pages.titleSx}>
        {template ? "Template" : "New template"}
      </Typography>
      <Stack spacing={Dialogs.formStackSpacing}>
        <TextField
          label="Name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          fullWidth
          required
        />
        <ApprovalStepEditor
          steps={steps}
          canUseEmployees={canUseEmployees}
          canUseTeams={canUseTeams}
          employees={stores.employeeStore.employees}
          teams={stores.teamStore.teams}
          onAddApprover={(stepIndex) =>
            updateStep(stepIndex, (current) => ({
              ...current,
              approvers: [...current.approvers, createEmptyApprover()],
            }))
          }
          onAddStep={addStep}
          onMoveStep={moveStep}
          onRemoveApprover={(stepIndex, approverIndex) =>
            updateStep(stepIndex, (current) => ({
              ...current,
              approvers:
                current.approvers.length === 1
                  ? current.approvers
                  : current.approvers.filter(
                    (_, index) => index !== approverIndex,
                  ),
            }))
          }
          onRemoveStep={removeStep}
          onUpdateApprover={updateApprover}
          onUpdateStep={updateStep}
        />
      </Stack>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={Dialogs.stepHeaderSpacing}
        sx={Dialogs.addStepButtonSx}
      >
        <Button variant="outlined" onClick={() => onClose(template?.id)}>
          Cancel
        </Button>
        {template && (
          <Button
            color="error"
            variant="outlined"
            onClick={() => setDeleteDialogIsOpen(true)}
          >
            Delete
          </Button>
        )}
        <Button variant="outlined" onClick={handleSubmit}>
          Save
        </Button>
      </Stack>
      {template && (
        <DeleteConfirmationDialog
          cancelFirst
          cancelLabel="Cancel"
          entityName={template.name}
          open={deleteDialogIsOpen}
          title="Delete template"
          onClose={() => setDeleteDialogIsOpen(false)}
          onDelete={() => onDelete(template.id)}
        />
      )}
    </>
  );
};

export default ApprovalStepTemplateEditor;
