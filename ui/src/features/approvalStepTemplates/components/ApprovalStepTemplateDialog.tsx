import { stores } from "@/app/rootStore";
import { ApprovalStepTemplate } from "@/features/approvalStepTemplates/models/approvalStepTemplate";
import ApprovalStepTemplateVisibilityEditor from "@/features/approvalStepTemplates/components/ApprovalStepTemplateVisibilityEditor";
import ApprovalRequestDetailsCard from "@/features/approvalRequests/components/ApprovalRequestDetailsCard";
import { ApprovalRequestStepVisibilitySubmission } from "@/features/approvalRequests/models/approvalRequest";
import ApprovalRequestSummary from "@/features/approvalRequests/components/ApprovalRequestSummary";
import ApprovalStepEditor from "@/features/approvalWorkflow/components/ApprovalStepEditor";
import ApprovalWorkflowFormContent from "@/features/approvalWorkflow/components/ApprovalWorkflowFormContent";
import {
  AssigneeType,
  ApprovalStepAssignee,
  ApprovalStepVisibilityMode,
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
import LoadingButton from "@mui/lab/LoadingButton";
import { Button, Stack, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { notification } from "@/shared/utils/notifications";

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
  const [isVisibilitySetup, setIsVisibilitySetup] = useState(false);
  const saveLoader = ActionLoaders.approvalStepTemplates.save(
    template?.globalId,
  );
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
    businessTenantIsSelected &&
    stores.applicationConfigurationStore.employeeAssigneesAreEnabled;
  const canUseTeams =
    businessTenantIsSelected &&
    stores.applicationConfigurationStore.teamAssigneesAreEnabled;
  const defaultAssigneeType = canUseEmployees
    ? AssigneeType.Employee
    : AssigneeType.User;

  useEffect(() => {
    setName(template?.name ?? "");
    setIsVisibilitySetup(false);
    setSteps(
      template
        ? createEditableSteps(template.steps)
        : [createEmptyStep(1, true, defaultAssigneeType)],
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
    defaultAssigneeType,
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
      createEmptyStep(current.length + 1, true, defaultAssigneeType),
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

  const createStepVisibilitySubmissions =
    (): ApprovalRequestStepVisibilitySubmission[] =>
      steps.flatMap((step) =>
        steps.flatMap((assigneeStep) =>
          assigneeStep.assignees.map((assignee, assigneeIndex) => ({
            stepSequence: step.sequence,
            assigneeStepSequence: assigneeStep.sequence,
            assigneeIndex,
            isVisible:
              step.sequence === assigneeStep.sequence ||
              (step.visibility?.find(
                (visibility) =>
                  visibility.assigneeGlobalId === assignee.globalId,
              )?.isVisible ??
                ((step.visibilityMode ??
                  ApprovalStepVisibilityMode.AllParticipants) ===
                  ApprovalStepVisibilityMode.AllParticipants ||
                  step.visibilityMode ===
                    ApprovalStepVisibilityMode.AllParticipantsExceptSelected)),
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
        ? await stores.approvalStepTemplateStore.update(
            tenantGlobalId,
            template.globalId,
            {
              name: name.trim(),
              stepVisibility: createStepVisibilitySubmissions(),
              steps: toApprovalStepSubmissions(steps),
            },
          )
        : await stores.approvalStepTemplateStore.create(tenantGlobalId, {
            name: name.trim(),
            stepVisibility: createStepVisibilitySubmissions(),
            steps: toApprovalStepSubmissions(steps),
          });
      if (saved) {
        showPersistenceSuccessNotification(
          PersistenceSuccessMessages.templateSaved,
        );
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
            state: template
              ? { currentTemplateGlobalId: template.globalId }
              : undefined,
            to: templatesPath,
          },
          {
            label: template ? "Template" : "New template",
            onClick: isVisibilitySetup
              ? () => setIsVisibilitySetup(false)
              : undefined,
          },
          ...(isVisibilitySetup ? [{ label: "Visibility" }] : []),
        ]}
      />
      <ApprovalWorkflowFormContent>
        {!isVisibilitySetup && (
          <Stack spacing={Dialogs.formStackSpacing}>
            <ApprovalRequestDetailsCard
              ariaLabel="Template details"
              showStatusBorder={false}
            >
              <TextField
                label="Name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                fullWidth
                required
              />
            </ApprovalRequestDetailsCard>
            <ApprovalStepEditor
              steps={steps}
              canUseEmployees={canUseEmployees}
              canUseTeams={canUseTeams}
              employees={stores.employeeStore.employees}
              teams={stores.teamStore.teams}
              onAddAssignee={(stepIndex) =>
                updateStep(stepIndex, (current) => ({
                  ...current,
                  assignees: [
                    ...current.assignees,
                    createEmptyAssignee(defaultAssigneeType),
                  ],
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
        )}
        {isVisibilitySetup && (
          <Stack spacing={Dialogs.formStackSpacing} sx={Dialogs.tabContentSx}>
            <ApprovalRequestDetailsCard
              ariaLabel="Template summary"
              showStatusBorder={false}
            >
              <ApprovalRequestSummary
                showDescription={false}
                showFiles={false}
                showRevision={false}
                title={name}
              />
            </ApprovalRequestDetailsCard>
            <ApprovalStepTemplateVisibilityEditor
              steps={steps}
              onUpdateStep={(stepIndex, step) =>
                updateStep(stepIndex, () => step)
              }
            />
          </Stack>
        )}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={Dialogs.stepHeaderSpacing}
          sx={Dialogs.addStepButtonSx}
        >
          {!isVisibilitySetup && (
            <Button
              variant="outlined"
              onClick={() => onClose(template?.globalId)}
            >
              Cancel
            </Button>
          )}
          {template && !isVisibilitySetup && (
            <Button
              color="error"
              variant="outlined"
              onClick={() => setDeleteDialogIsOpen(true)}
            >
              Delete
            </Button>
          )}
          {isVisibilitySetup ? (
            <>
              <Button
                startIcon={<ArrowBack />}
                onClick={() => setIsVisibilitySetup(false)}
              >
                Back
              </Button>
              <LoadingButton
                loading={saveAction.isRunning}
                variant="outlined"
                onClick={handleSubmit}
              >
                Save
              </LoadingButton>
            </>
          ) : steps.length > 1 ? (
            <Button endIcon={<ArrowForward />} onClick={showVisibilitySetup}>
              Next
            </Button>
          ) : (
            <LoadingButton
              loading={saveAction.isRunning}
              variant="outlined"
              onClick={handleSubmit}
            >
              Save
            </LoadingButton>
          )}
        </Stack>
      </ApprovalWorkflowFormContent>
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
    </CloseOnEscape>
  );
};

export default ApprovalStepTemplateEditor;
