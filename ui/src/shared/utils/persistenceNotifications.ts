import { Notifications } from "@/shared/config/application";
import { notification } from "@/shared/utils/notifications";

export const showPersistenceSuccessNotification = (message: string): void => {
  if (Notifications.showPersistenceSuccess) {
    notification.success(message);
  }
};

export const PersistenceSuccessMessages = {
  approvalDecisionSubmitted: "Decision submitted successfully.",
  approvalRequestCanceled: "Request canceled successfully.",
  approvalRequestDeleted: "Request deleted successfully.",
  approvalRequestSubmitted: "Request submitted successfully.",
  delegationDeleted: "Delegation deleted successfully.",
  delegationSaved: "Delegation saved successfully.",
  employeeDeleted: "Employee deleted successfully.",
  employeeSaved: "Employee saved successfully.",
  employeeSavedInvitationSent: "Employee saved successfully. Invitation sent.",
  organizationSaved: "Organization saved successfully.",
  profileSaved: "Profile saved successfully.",
  receiptDeleted: "Receipt deleted successfully.",
  receiptLinkCopied: "Receipt link copied successfully.",
  receiptLinkCreated: "Receipt link created and copied successfully.",
  receiptLinkDeleted: "Receipt link deleted successfully.",
  scheduledPlanChangeCanceled: "Scheduled plan change canceled successfully.",
  subscriptionPlanChanged: "Plan changed successfully.",
  teamDeleted: "Team deleted successfully.",
  teamSaved: "Team saved successfully.",
  templateDeleted: "Template deleted successfully.",
  templateSaved: "Template saved successfully.",
} as const;
