import { Toasts } from "@/shared/constants/constants";
import { toast } from "react-toastify";

export const showPersistenceSuccessToast = (message: string): void => {
  if (Toasts.showPersistenceSuccess) {
    toast.success(message);
  }
};

export const PersistenceSuccessMessages = {
  approvalDecisionSubmitted: "Approval decision submitted successfully.",
  approvalRequestSubmitted: "Approval request submitted successfully.",
  delegationDeleted: "Delegation deleted successfully.",
  delegationSaved: "Delegation saved successfully.",
  employeeDeleted: "Employee deleted successfully.",
  employeeSaved: "Employee saved successfully.",
  organizationDeleted: "Organization deleted successfully.",
  organizationSaved: "Organization saved successfully.",
  profileSaved: "Profile saved successfully.",
  teamDeleted: "Team deleted successfully.",
  teamSaved: "Team saved successfully.",
  templateDeleted: "Template deleted successfully.",
  templateSaved: "Template saved successfully.",
} as const;
