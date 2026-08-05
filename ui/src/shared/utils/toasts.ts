import { Toasts } from "@/shared/constants/constants";
import { toast } from "react-toastify";

export const showPersistenceSuccessToast = (message: string): void => {
  if (Toasts.showPersistenceSuccess) {
    toast.success(message);
  }
};

export const PersistenceSuccessMessages = {
  approvalDecisionSubmitted: "Decision submitted successfully.",
  approvalRequestCanceled: "Request canceled successfully.",
  approvalRequestSubmitted: "Request submitted successfully.",
  delegationDeleted: "Delegation deleted successfully.",
  delegationSaved: "Delegation saved successfully.",
  employeeDeleted: "Employee deleted successfully.",
  employeeSaved: "Employee saved successfully.",
  organizationSaved: "Organization saved successfully.",
  profileSaved: "Profile saved successfully.",
  sharedVerificationLinkCopied: "Shared verification link copied successfully.",
  sharedVerificationLinkCreated: "Shared verification link created and copied successfully.",
  sharedVerificationLinkDeleted: "Shared verification link deleted successfully.",
  teamDeleted: "Team deleted successfully.",
  teamSaved: "Team saved successfully.",
  templateDeleted: "Template deleted successfully.",
  templateSaved: "Template saved successfully.",
} as const;
