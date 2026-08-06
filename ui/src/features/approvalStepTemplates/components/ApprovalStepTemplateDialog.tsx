import { stores } from "@/app/rootStore";
import { ApprovalStepTemplate } from "@/features/approvalStepTemplates/models/approvalStepTemplate";
import ApprovalStepEditor from "@/features/approvalWorkflow/components/ApprovalStepEditor";
import {
  AssigneeType,
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
    businessTenantIsSelected && stores.productStore.employeeAssigneesAreEnabled;
  const canUseTeams =
    businessTenantIsSelected && stores.productStore.teamAssigneesAreEnabled;

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

  const validateSteps = () => {
    const emails = steps.flatMap((step) =>
      step.assignees
        .filter((assignee) => assignee.type === AssigneeType.Email)
        .map((assignee) => assignee.email ?? ""),
    );
    const hasMissingRecipient = steps.some((step) =>
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
          onAddAssignee={(stepIndex) =>
            updateStep(stepIndex, (current) => ({
              ...current,
              assignees: [...current.assignees, createEmptyAssignee()],
            }))
          }
          onAddStep={addStep}
          onMoveStep={moveStep}
          onRemoveAssignee={(stepIndex, assigneeIndex) =>
            updateStep(stepIndex, (current) => ({
              ...current,
              assignees:
                current.assignees.length === 1
                  ? current.assignees
                  : current.assignees.filter(
                    (_, index) => index !== assigneeIndex,
                  ),
            }))
          }
          onRemoveStep={removeStep}
          onUpdateAssignee={updateAssignee}
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
