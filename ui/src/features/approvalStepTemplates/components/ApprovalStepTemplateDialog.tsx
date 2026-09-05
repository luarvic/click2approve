import { stores } from "@/app/rootStore";
import ApprovalRequestDetailsCard from "@/features/approvalRequests/components/ApprovalRequestDetailsCard";
import { ApprovalStepTemplate } from "@/features/approvalStepTemplates/models/approvalStepTemplate";
import ApprovalStepEditor from "@/features/approvalWorkflow/components/ApprovalStepEditor";
import { useEditableApprovalSteps } from "@/features/approvalWorkflow/hooks/useEditableApprovalSteps";
import { AssigneeType } from "@/features/approvalWorkflow/models/approvalStep";
import {
  createEditableSteps,
  createEmptyStep,
  toApprovalStepSubmissions,
} from "@/features/approvalWorkflow/models/editableApprovalStep";
import { TenantType } from "@/features/tenants/models/tenant";
import MainActionButton from "@/shared/components/buttons/MainActionButton";
import DeleteConfirmationDialog from "@/shared/components/dialogs/DeleteConfirmationDialog";
import { Forms } from "@/shared/components/dialogs/formStyles";
import CloseOnEscape from "@/shared/components/navigation/CloseOnEscape";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { Routes } from "@/shared/routing/routes";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
import { notification } from "@/shared/utils/notifications";
import {
  PersistenceSuccessMessages,
  showPersistenceSuccessNotification,
} from "@/shared/utils/persistenceNotifications";
import { Button, Stack, TextField } from "@mui/material";
import { useEffect, useState } from "react";

interface ApprovalStepTemplateEditorProps {
  template: ApprovalStepTemplate | null;
  onClose: (currentTemplateGlobalId?: string) => void;
  onDelete: (templateGlobalId: string) => Promise<boolean>;
}

const ApprovalStepTemplateEditor: React.FC<ApprovalStepTemplateEditorProps> = ({ template, onClose, onDelete }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [deleteDialogIsOpen, setDeleteDialogIsOpen] = useState(false);
  const saveLoader = ActionLoaders.approvalStepTemplates.save(template?.globalId);
  const saveAction = useAsyncAction(saveLoader);
  const tenantGlobalId = stores.tenantStore.currentTenantGlobalId;
  const templatesPath = tenantGlobalId ? Routes.tenantPath(tenantGlobalId, "/approvalStepTemplates") : "/";
  const businessTenantIsSelected = stores.tenantStore.currentTenant?.type === TenantType.Business;
  const canUseEmployees = businessTenantIsSelected && stores.applicationConfigurationStore.employeeAssigneesAreEnabled;
  const canUseTeams = businessTenantIsSelected && stores.applicationConfigurationStore.teamAssigneesAreEnabled;
  const defaultAssigneeType = canUseEmployees ? AssigneeType.Employee : AssigneeType.User;
  const {
    addAssignee,
    addStep,
    moveStep,
    removeAssignee: removeEditableAssignee,
    removeStep,
    setSteps,
    steps,
    updateAssignee,
    updateStep,
  } = useEditableApprovalSteps({
    defaultAssigneeType,
    initialSteps: [createEmptyStep(1)],
  });

  useEffect(() => {
    setName(template?.name ?? "");
    setDescription(template?.description ?? "");
    setSteps(template ? createEditableSteps(template.steps) : [createEmptyStep(1, true, defaultAssigneeType)]);
    if (tenantGlobalId && businessTenantIsSelected) {
      if (canUseEmployees) {
        stores.employeeStore.loadPicker(tenantGlobalId);
      }
      if (canUseTeams) {
        stores.teamStore.loadPicker(tenantGlobalId);
      }
    }
  }, [template, tenantGlobalId, businessTenantIsSelected, canUseEmployees, canUseTeams, defaultAssigneeType, setSteps]);

  const removeAssignee = (stepIndex: number, assigneeIndex: number) => {
    if ((steps[stepIndex]?.assignees.length ?? 0) > 1) {
      removeEditableAssignee(stepIndex, assigneeIndex);
    }
  };

  const validateSteps = () => {
    const hasMissingRecipient = steps.some((step) =>
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

  const handleSubmit = async () => {
    if (!tenantGlobalId) {
      return;
    }
    if (!validateTemplate()) {
      return;
    }

    await saveAction.run(async () => {
      const saved = template
        ? await stores.approvalStepTemplateStore.update(tenantGlobalId, template.globalId, {
            description,
            name: name.trim(),
            steps: toApprovalStepSubmissions(steps),
          })
        : await stores.approvalStepTemplateStore.create(tenantGlobalId, {
            description,
            name: name.trim(),
            steps: toApprovalStepSubmissions(steps),
          });
      if (saved) {
        showPersistenceSuccessNotification(PersistenceSuccessMessages.templateSaved);
        onClose(saved.globalId);
      }
    });
  };

  const validateTemplate = () => {
    if (!name.trim()) {
      notification.warning("Template name is required.");
      return false;
    }

    return validateSteps();
  };

  return (
    <CloseOnEscape onClose={() => onClose(template?.globalId)}>
      <PageBreadcrumbs
        items={[
          {
            label: "Templates",
            state: template ? { currentTemplateGlobalId: template.globalId } : undefined,
            to: templatesPath,
          },
          {
            label: template?.name ?? "New template",
          },
        ]}
      />
      <Stack spacing={Forms.formStackSpacing}>
        <ApprovalRequestDetailsCard ariaLabel="Template details" elevated showStatusBorder={false}>
          <TextField label="Name" value={name} onChange={(event) => setName(event.target.value)} fullWidth required />
          <TextField
            fullWidth
            label="Description"
            multiline
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </ApprovalRequestDetailsCard>
        <ApprovalStepEditor
          steps={steps}
          canUseEmployees={canUseEmployees}
          canUseTeams={canUseTeams}
          employees={stores.employeeStore.pickerEmployees}
          teams={stores.teamStore.pickerTeams}
          onAddAssignee={addAssignee}
          onAddStep={addStep}
          onMoveStep={moveStep}
          onRemoveAssignee={removeAssignee}
          onRemoveStep={removeStep}
          onUpdateAssignee={updateAssignee}
          onUpdateStep={updateStep}
          showAttachmentRequirement={stores.applicationConfigurationStore.taskAttachmentsAreEnabled}
          showOrganizationEmployeesVisibility={businessTenantIsSelected}
        />
      </Stack>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={Forms.actionSpacing} sx={Forms.addActionSx}>
        <Button variant="outlined" onClick={() => onClose(template?.globalId)}>
          Cancel
        </Button>
        {template && (
          <Button color="error" variant="outlined" onClick={() => setDeleteDialogIsOpen(true)}>
            Delete
          </Button>
        )}
        <MainActionButton loading={saveAction.isRunning} onClick={handleSubmit}>
          Save
        </MainActionButton>
      </Stack>
      {template && (
        <DeleteConfirmationDialog
          cancelLabel="Cancel"
          entityName={template.name}
          open={deleteDialogIsOpen}
          title="Delete template"
          onClose={() => setDeleteDialogIsOpen(false)}
          onDelete={() => onDelete(template.globalId)}
        />
      )}
    </CloseOnEscape>
  );
};

export default ApprovalStepTemplateEditor;
