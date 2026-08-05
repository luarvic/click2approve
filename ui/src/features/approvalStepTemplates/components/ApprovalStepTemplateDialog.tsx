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
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import { Dialogs, Routes } from "@/shared/constants/constants";
import {
  PersistenceSuccessMessages,
  showPersistenceSuccessToast,
} from "@/shared/utils/toasts";
import { validateEmails } from "@/shared/utils/validators";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
import LoadingButton from "@mui/lab/LoadingButton";
import { Button, Stack, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface ApprovalStepTemplateEditorProps {
  template: ApprovalStepTemplate | null;
  onClose: (currentTemplateGlobalId?: string) => void;
  onDelete: (templateGlobalId: string) => Promise<boolean>;
}

const ApprovalStepTemplateEditor: React.FC<ApprovalStepTemplateEditorProps> = ({
  template,
  onClose,
  onDelete,
}) => {
  const [name, setName] = useState("");
  const [deleteDialogIsOpen, setDeleteDialogIsOpen] = useState(false);
  const saveLoader = ActionLoaders.approvalStepTemplates.save(template?.globalId);
  const saveAction = useAsyncAction(saveLoader);
  const [steps, setSteps] = useState<EditableApprovalStep[]>([
    createEmptyStep(1),
  ]);
  const tenantGlobalId = stores.tenantStore.currentTenantGlobalId;
  const templatesPath = tenantGlobalId
    ? Routes.tenantPath(tenantGlobalId, "/approvalStepTemplates")
    : "/";
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
    if (tenantGlobalId && businessTenantIsSelected) {
      if (canUseEmployees) {
        stores.employeeStore.load(tenantGlobalId);
      }
      if (canUseTeams) {
        stores.teamStore.load(tenantGlobalId);
      }
    }
  }, [
    template,
    tenantGlobalId,
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

  const handleSubmit = async () => {
    if (!tenantGlobalId) {
      return;
    }
    if (!name.trim()) {
      toast.error("Template name is required.");
      return;
    }
    if (!validateSteps()) {
      return;
    }

    await saveAction.run(async () => {
      const saved = template
        ? await stores.approvalStepTemplateStore.update(tenantGlobalId, template.globalId, {
            name: name.trim(),
            steps: toApprovalStepSubmissions(steps),
          })
        : await stores.approvalStepTemplateStore.create(tenantGlobalId, {
            name: name.trim(),
            steps: toApprovalStepSubmissions(steps),
          });
      if (saved) {
        showPersistenceSuccessToast(PersistenceSuccessMessages.templateSaved);
        onClose(saved.globalId);
      }
    });
  };

  return (
    <>
      <PageBreadcrumbs
        items={[
          {
            label: "Templates",
            state: template ? { currentTemplateGlobalId: template.globalId } : undefined,
            to: templatesPath,
          },
          { label: template ? "Template" : "New template" },
        ]}
      />
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
        <Button variant="outlined" onClick={() => onClose(template?.globalId)}>
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
        <LoadingButton loading={saveAction.isRunning} variant="outlined" onClick={handleSubmit}>
          Save
        </LoadingButton>
      </Stack>
      {template && (
        <DeleteConfirmationDialog
          cancelFirst
          cancelLabel="Cancel"
          entityName={template.name}
          open={deleteDialogIsOpen}
          title="Delete template"
          onClose={() => setDeleteDialogIsOpen(false)}
          onDelete={() => onDelete(template.globalId)}
        />
      )}
    </>
  );
};

export default ApprovalStepTemplateEditor;
