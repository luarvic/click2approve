import { ApprovalStepAssignee, AssigneeType } from "@/features/approvalWorkflow/models/approvalStep";
import {
  createEmptyAssignee,
  createEmptyStep,
  EditableApprovalStep,
} from "@/features/approvalWorkflow/models/editableApprovalStep";
import { useState } from "react";

interface UseEditableApprovalStepsOptions {
  defaultAssigneeType: AssigneeType;
  initialSteps: EditableApprovalStep[];
}

export const useEditableApprovalSteps = ({ defaultAssigneeType, initialSteps }: UseEditableApprovalStepsOptions) => {
  const [steps, setSteps] = useState(initialSteps);

  const updateStep = (stepIndex: number, updater: (step: EditableApprovalStep) => EditableApprovalStep) => {
    setSteps((currentSteps) => currentSteps.map((step, index) => (index === stepIndex ? updater(step) : step)));
  };

  const addStep = () => {
    setSteps((currentSteps) => [...currentSteps, createEmptyStep(currentSteps.length + 1, true, defaultAssigneeType)]);
  };

  const removeStep = (stepIndex: number) => {
    setSteps((currentSteps) =>
      currentSteps.filter((_, index) => index !== stepIndex).map((step, index) => ({ ...step, sequence: index + 1 })),
    );
  };

  const moveStep = (stepIndex: number, direction: -1 | 1) => {
    const nextIndex = stepIndex + direction;
    setSteps((currentSteps) => {
      if (nextIndex < 0 || nextIndex >= currentSteps.length) {
        return currentSteps;
      }

      const reordered = [...currentSteps];
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

  return {
    addAssignee,
    addStep,
    moveStep,
    removeAssignee,
    removeStep,
    setSteps,
    steps,
    updateAssignee,
    updateStep,
  };
};
