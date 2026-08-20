import { stores } from "@/app/rootStore";
import { ApprovalStepTemplate } from "@/features/approvalStepTemplates/models/approvalStepTemplate";
import ApprovalStepTemplateVisibilityEditor from "@/features/approvalStepTemplates/components/ApprovalStepTemplateVisibilityEditor";
import ApprovalRequestDetailsCard from "@/features/approvalRequests/components/ApprovalRequestDetailsCard";
import { ApprovalRequestStepVisibilitySubmission } from "@/features/approvalRequests/models/approvalRequest";
import ApprovalRequestSummary from "@/features/approvalRequests/components/ApprovalRequestSummary";
import ApprovalStepEditor from "@/features/approvalWorkflow/components/ApprovalStepEditor";
import { useEditableApprovalSteps } from "@/features/approvalWorkflow/hooks/useEditableApprovalSteps";
import { AssigneeType, ApprovalStepVisibilityMode } from "@/features/approvalWorkflow/models/approvalStep";
import {
  createEditableSteps,
  createEmptyStep,
  toApprovalStepSubmissions,
} from "@/features/approvalWorkflow/models/editableApprovalStep";
import { TenantType } from "@/features/tenants/models/tenant";
import MainActionButton from "@/shared/components/buttons/MainActionButton";
import DeleteConfirmationDialog from "@/shared/components/dialogs/DeleteConfirmationDialog";
import CloseOnEscape from "@/shared/components/navigation/CloseOnEscape";
import PageBreadcrumbs from "@/shared/components/navigation/PageBreadcrumbs";
import { Dialogs, Routes } from "@/shared/constants/constants";
import {
  PersistenceSuccessMessages,
  showPersistenceSuccessNotification,
} from "@/shared/utils/persistenceNotifications";
import { useAsyncAction } from "@/shared/hooks/useAsyncAction";
import { ActionLoaders } from "@/shared/utils/actionLoaders";
import { ArrowBack, ArrowForward } from "@mui/icons-material";
import { Button, Stack, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { notification } from "@/shared/utils/notifications";

interface ApprovalStepTemplateEditorProps {
  template: ApprovalStepTemplate | null;
  onClose: (currentTemplateGlobalId?: string) => void;
  onDelete: (templateGlobalId: string) => Promise<boolean>;
}

const ApprovalStepTemplateEditor: React.FC<ApprovalStepTemplateEditorProps> = ({ template, onClose, onDelete }) => {
  const [name, setName] = useState("");
  const [deleteDialogIsOpen, setDeleteDialogIsOpen] = useState(false);
  const [isVisibilitySetup, setIsVisibilitySetup] = useState(false);
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
    setIsVisibilitySetup(false);
    setSteps(template ? createEditableSteps(template.steps) : [createEmptyStep(1, true, defaultAssigneeType)]);
    if (tenantGlobalId && businessTenantIsSelected) {
      if (canUseEmployees) {
        stores.employeeStore.load(tenantGlobalId);
      }
      if (canUseTeams) {
        stores.teamStore.load(tenantGlobalId);
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

  const createStepVisibilitySubmissions = (): ApprovalRequestStepVisibilitySubmission[] =>
    steps.flatMap((step) =>
      steps.flatMap((assigneeStep) =>
        assigneeStep.assignees.map((assignee, assigneeIndex) => ({
          stepSequence: step.sequence,
          assigneeStepSequence: assigneeStep.sequence,
          assigneeIndex,
          isVisible:
            step.sequence === assigneeStep.sequence ||
            (step.visibility?.find((visibility) => visibility.assigneeGlobalId === assignee.globalId)?.isVisible ??
              ((step.visibilityMode ?? ApprovalStepVisibilityMode.AllParticipants) ===
                ApprovalStepVisibilityMode.AllParticipants ||
                step.visibilityMode === ApprovalStepVisibilityMode.AllParticipantsExceptSelected)),
        })),
      ),
    );

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
            name: name.trim(),
            stepVisibility: createStepVisibilitySubmissions(),
            steps: toApprovalStepSubmissions(steps),
          })
        : await stores.approvalStepTemplateStore.create(tenantGlobalId, {
            name: name.trim(),
            stepVisibility: createStepVisibilitySubmissions(),
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

  const showVisibilitySetup = () => {
    if (validateTemplate()) {
      setIsVisibilitySetup(true);
    }
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
            label: template ? "Template" : "New template",
            onClick: isVisibilitySetup ? () => setIsVisibilitySetup(false) : undefined,
          },
          ...(isVisibilitySetup ? [{ label: "Visibility" }] : []),
        ]}
      />
      {!isVisibilitySetup && (
        <Stack spacing={Dialogs.formStackSpacing}>
          <ApprovalRequestDetailsCard ariaLabel="Template details" showStatusBorder={false}>
            <TextField label="Name" value={name} onChange={(event) => setName(event.target.value)} fullWidth required />
          </ApprovalRequestDetailsCard>
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
            showAttachmentRequirement={stores.applicationConfigurationStore.taskAttachmentsAreEnabled}
          />
        </Stack>
      )}
      {isVisibilitySetup && (
        <Stack spacing={Dialogs.formStackSpacing} sx={Dialogs.tabContentSx}>
          <ApprovalRequestDetailsCard ariaLabel="Template summary" showStatusBorder={false}>
            <ApprovalRequestSummary showDescription={false} showFiles={false} showRevision={false} title={name} />
          </ApprovalRequestDetailsCard>
          <ApprovalStepTemplateVisibilityEditor
            steps={steps}
            onUpdateStep={(stepIndex, step) => updateStep(stepIndex, () => step)}
          />
        </Stack>
      )}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={Dialogs.stepHeaderSpacing} sx={Dialogs.addStepButtonSx}>
        {!isVisibilitySetup && (
          <Button variant="outlined" onClick={() => onClose(template?.globalId)}>
            Cancel
          </Button>
        )}
        {template && !isVisibilitySetup && (
          <Button color="error" variant="outlined" onClick={() => setDeleteDialogIsOpen(true)}>
            Delete
          </Button>
        )}
        {isVisibilitySetup ? (
          <>
            <Button startIcon={<ArrowBack />} onClick={() => setIsVisibilitySetup(false)}>
              Back
            </Button>
            <MainActionButton loading={saveAction.isRunning} onClick={handleSubmit}>
              Save
            </MainActionButton>
          </>
        ) : steps.length > 1 ? (
          <MainActionButton endIcon={<ArrowForward />} onClick={showVisibilitySetup}>
            Next
          </MainActionButton>
        ) : (
          <MainActionButton loading={saveAction.isRunning} onClick={handleSubmit}>
            Save
          </MainActionButton>
        )}
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
