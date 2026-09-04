const createActionLoaderKey = (...parts: Array<string | undefined>): string => parts.filter(Boolean).join(".");

export const ActionLoaderScopes = {
  approvalRequestsCancel: "approvalRequests.cancel",
  approvalRequestsLoad: "approvalRequests.load",
  approvalRequestsSubmit: "approvalRequests.submit",
  approvalRequestTasksAttachFiles: "approvalRequestTasks.attachFiles",
  approvalRequestTasksComplete: "approvalRequestTasks.complete",
  approvalRequestTasksLoad: "approvalRequestTasks.load",
  approvalRequestTasksRemoveAttachment: "approvalRequestTasks.removeAttachment",
  approvalStepTemplatesSave: "approvalStepTemplates.save",
  delegationsSave: "delegations.save",
  dialogsConfirm: "dialogs.confirm",
  dialogsDelete: "dialogs.delete",
  discussionsLoadForRequest: "discussions.loadForRequest",
  discussionsLoadForTask: "discussions.loadForTask",
  discussionsSendForRequest: "discussions.sendForRequest",
  discussionsSendForTask: "discussions.sendForTask",
  employeesSave: "employees.save",
  gridsApprovalStepTemplates: "grids.approvalStepTemplates",
  gridsDelegations: "grids.delegations",
  gridsEmployees: "grids.employees",
  gridsTasks: "grids.tasks",
  gridsNotifications: "grids.notifications",
  gridsPasskeys: "grids.passkeys",
  gridsRequests: "grids.requests",
  gridsReceipts: "grids.receipts",
  gridsTeams: "grids.teams",
  gridsTenants: "grids.tenants",
  notificationsDelete: "notifications.delete",
  notificationsMarkRead: "notifications.markRead",
  pagesApprovalRequestStart: "pages.approvalRequestStart",
  pagesApprovalRequestSubmit: "pages.approvalRequestSubmit",
  pagesApprovalStepTemplateEditor: "pages.approvalStepTemplateEditor",
  pagesDelegationEditor: "pages.delegationEditor",
  pagesEmployeeEditor: "pages.employeeEditor",
  pagesTeamEditor: "pages.teamEditor",
  pagesTenantScope: "pages.tenantScope",
  pagesUserProfile: "pages.userProfile",
  subscriptionPlanChange: "subscriptionPlan.change",
  subscriptionPlanLoad: "subscriptionPlan.load",
  subscriptionUsageLoad: "subscriptionUsage.load",
  passkeysAdd: "passkeys.add",
  passkeysRemove: "passkeys.remove",
  receiptLinksCreateForRequest: "receiptLinks.createForRequest",
  receiptLinksCreateForTask: "receiptLinks.createForTask",
  receiptLinksDelete: "receiptLinks.delete",
  teamsSave: "teams.save",
  tenantsSave: "tenants.save",
  userFilesDelete: "userFiles.delete",
  userFilesUpload: "userFiles.upload",
  userProfileRemoveAvatar: "userProfile.removeAvatar",
  userProfileSave: "userProfile.save",
} as const;

export const GlobalLoadingActionLoaderScopes = [
  ActionLoaderScopes.gridsApprovalStepTemplates,
  ActionLoaderScopes.gridsDelegations,
  ActionLoaderScopes.gridsEmployees,
  ActionLoaderScopes.gridsTasks,
  ActionLoaderScopes.gridsNotifications,
  ActionLoaderScopes.gridsPasskeys,
  ActionLoaderScopes.gridsRequests,
  ActionLoaderScopes.gridsReceipts,
  ActionLoaderScopes.gridsTeams,
  ActionLoaderScopes.gridsTenants,
  ActionLoaderScopes.approvalRequestsLoad,
  ActionLoaderScopes.approvalRequestTasksLoad,
  ActionLoaderScopes.discussionsLoadForRequest,
  ActionLoaderScopes.discussionsLoadForTask,
  ActionLoaderScopes.pagesApprovalRequestStart,
  ActionLoaderScopes.pagesApprovalRequestSubmit,
  ActionLoaderScopes.pagesApprovalStepTemplateEditor,
  ActionLoaderScopes.pagesDelegationEditor,
  ActionLoaderScopes.pagesEmployeeEditor,
  ActionLoaderScopes.pagesTeamEditor,
  ActionLoaderScopes.pagesTenantScope,
  ActionLoaderScopes.pagesUserProfile,
  ActionLoaderScopes.subscriptionPlanChange,
  ActionLoaderScopes.subscriptionPlanLoad,
  ActionLoaderScopes.subscriptionUsageLoad,
] as const;

export const ActionLoaders = {
  approvalRequests: {
    cancel: (approvalRequestGlobalId: string | undefined) =>
      createActionLoaderKey(ActionLoaderScopes.approvalRequestsCancel, approvalRequestGlobalId),
    load: (approvalRequestGlobalId: string | undefined) =>
      createActionLoaderKey(ActionLoaderScopes.approvalRequestsLoad, approvalRequestGlobalId),
    submit: () => ActionLoaderScopes.approvalRequestsSubmit,
  },
  approvalRequestTasks: {
    attachFiles: (taskGlobalId: string | undefined) =>
      createActionLoaderKey(ActionLoaderScopes.approvalRequestTasksAttachFiles, taskGlobalId),
    complete: (taskGlobalId: string | undefined) =>
      createActionLoaderKey(ActionLoaderScopes.approvalRequestTasksComplete, taskGlobalId),
    load: (taskGlobalId: string | undefined) =>
      createActionLoaderKey(ActionLoaderScopes.approvalRequestTasksLoad, taskGlobalId),
    removeAttachment: (taskGlobalId: string | undefined, userFileGlobalId: string | undefined) =>
      createActionLoaderKey(ActionLoaderScopes.approvalRequestTasksRemoveAttachment, taskGlobalId, userFileGlobalId),
  },
  approvalStepTemplates: {
    save: (templateGlobalId: string | undefined) =>
      createActionLoaderKey(ActionLoaderScopes.approvalStepTemplatesSave, templateGlobalId),
  },
  delegations: {
    save: (delegationGlobalId: string | undefined) =>
      createActionLoaderKey(ActionLoaderScopes.delegationsSave, delegationGlobalId),
  },
  dialogs: {
    confirm: () => ActionLoaderScopes.dialogsConfirm,
    delete: () => ActionLoaderScopes.dialogsDelete,
  },
  discussions: {
    loadForRequest: (approvalRequestGlobalId: string | undefined) =>
      createActionLoaderKey(ActionLoaderScopes.discussionsLoadForRequest, approvalRequestGlobalId),
    loadForTask: (approvalRequestTaskGlobalId: string | undefined) =>
      createActionLoaderKey(ActionLoaderScopes.discussionsLoadForTask, approvalRequestTaskGlobalId),
    sendForRequest: (approvalRequestGlobalId: string | undefined) =>
      createActionLoaderKey(ActionLoaderScopes.discussionsSendForRequest, approvalRequestGlobalId),
    sendForTask: (approvalRequestTaskGlobalId: string | undefined) =>
      createActionLoaderKey(ActionLoaderScopes.discussionsSendForTask, approvalRequestTaskGlobalId),
  },
  employees: {
    save: (employeeGlobalId: string | undefined) =>
      createActionLoaderKey(ActionLoaderScopes.employeesSave, employeeGlobalId),
  },
  notifications: {
    delete: (tenantGlobalId: string | null | undefined) =>
      createActionLoaderKey(ActionLoaderScopes.notificationsDelete, tenantGlobalId ?? undefined),
    markRead: (tenantGlobalId: string | null | undefined) =>
      createActionLoaderKey(ActionLoaderScopes.notificationsMarkRead, tenantGlobalId ?? undefined),
  },
  passkeys: {
    add: () => ActionLoaderScopes.passkeysAdd,
    remove: (credentialId: string | undefined) =>
      createActionLoaderKey(ActionLoaderScopes.passkeysRemove, credentialId),
  },
  pages: {
    approvalRequestStart: () => ActionLoaderScopes.pagesApprovalRequestStart,
    approvalRequestSubmit: (approvalRequestGlobalId: string | undefined) =>
      createActionLoaderKey(ActionLoaderScopes.pagesApprovalRequestSubmit, approvalRequestGlobalId),
    approvalStepTemplateEditor: (templateGlobalId: string | undefined) =>
      createActionLoaderKey(ActionLoaderScopes.pagesApprovalStepTemplateEditor, templateGlobalId),
    delegationEditor: (delegationGlobalId: string | undefined) =>
      createActionLoaderKey(ActionLoaderScopes.pagesDelegationEditor, delegationGlobalId),
    employeeEditor: (employeeGlobalId: string | undefined) =>
      createActionLoaderKey(ActionLoaderScopes.pagesEmployeeEditor, employeeGlobalId),
    teamEditor: (teamGlobalId: string | undefined) =>
      createActionLoaderKey(ActionLoaderScopes.pagesTeamEditor, teamGlobalId),
    tenantScope: () => ActionLoaderScopes.pagesTenantScope,
    userProfile: () => ActionLoaderScopes.pagesUserProfile,
  },
  grids: {
    approvalStepTemplates: (tenantGlobalId: string | null | undefined) =>
      createActionLoaderKey(ActionLoaderScopes.gridsApprovalStepTemplates, tenantGlobalId ?? undefined),
    delegations: (tenantGlobalId: string | null | undefined) =>
      createActionLoaderKey(ActionLoaderScopes.gridsDelegations, tenantGlobalId ?? undefined),
    employees: (tenantGlobalId: string | null | undefined) =>
      createActionLoaderKey(ActionLoaderScopes.gridsEmployees, tenantGlobalId ?? undefined),
    requests: (tenantGlobalId: string | null | undefined) =>
      createActionLoaderKey(ActionLoaderScopes.gridsRequests, tenantGlobalId ?? undefined),
    tasks: (tenantGlobalId: string | null | undefined) =>
      createActionLoaderKey(ActionLoaderScopes.gridsTasks, tenantGlobalId ?? undefined),
    receipts: (tenantGlobalId: string | null | undefined) =>
      createActionLoaderKey(ActionLoaderScopes.gridsReceipts, tenantGlobalId ?? undefined),
    notifications: (tenantGlobalId: string | null | undefined) =>
      createActionLoaderKey(ActionLoaderScopes.gridsNotifications, tenantGlobalId ?? undefined),
    passkeys: () => ActionLoaderScopes.gridsPasskeys,
    teams: (tenantGlobalId: string | null | undefined) =>
      createActionLoaderKey(ActionLoaderScopes.gridsTeams, tenantGlobalId ?? undefined),
    tenants: () => ActionLoaderScopes.gridsTenants,
  },
  receiptLinks: {
    createForRequest: (approvalRequestGlobalId: string | undefined) =>
      createActionLoaderKey(ActionLoaderScopes.receiptLinksCreateForRequest, approvalRequestGlobalId),
    createForTask: (approvalRequestTaskGlobalId: string | undefined) =>
      createActionLoaderKey(ActionLoaderScopes.receiptLinksCreateForTask, approvalRequestTaskGlobalId),
    delete: (linkGlobalId: string | undefined) =>
      createActionLoaderKey(ActionLoaderScopes.receiptLinksDelete, linkGlobalId),
  },
  subscriptionUsage: {
    load: (tenantGlobalId: string | undefined) =>
      createActionLoaderKey(ActionLoaderScopes.subscriptionUsageLoad, tenantGlobalId),
  },
  subscriptionPlan: {
    change: (tenantGlobalId: string | undefined) =>
      createActionLoaderKey(ActionLoaderScopes.subscriptionPlanChange, tenantGlobalId),
    load: () => ActionLoaderScopes.subscriptionPlanLoad,
  },
  teams: {
    save: (teamGlobalId: string | undefined) => createActionLoaderKey(ActionLoaderScopes.teamsSave, teamGlobalId),
  },
  tenants: {
    save: (tenantGlobalId: string | undefined) => createActionLoaderKey(ActionLoaderScopes.tenantsSave, tenantGlobalId),
  },
  userProfile: {
    removeAvatar: () => ActionLoaderScopes.userProfileRemoveAvatar,
    save: () => ActionLoaderScopes.userProfileSave,
  },
  userFiles: {
    delete: (userFileGlobalId: string | undefined) =>
      createActionLoaderKey(ActionLoaderScopes.userFilesDelete, userFileGlobalId),
    upload: (tenantGlobalId: string | undefined) =>
      createActionLoaderKey(ActionLoaderScopes.userFilesUpload, tenantGlobalId),
  },
} as const;
