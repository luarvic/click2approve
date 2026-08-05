const formatActionLoader = (...parts: Array<string | undefined>): string =>
  parts.filter(Boolean).join(".");

export const ActionLoaders = {
  approvalRequests: {
    cancel: (approvalRequestGlobalId: string | undefined) =>
      formatActionLoader("approvalRequests", "cancel", approvalRequestGlobalId),
    submit: () => formatActionLoader("approvalRequests", "submit"),
  },
  approvalRequestTasks: {
    complete: (taskGlobalId: string | undefined) =>
      formatActionLoader("approvalRequestTasks", "complete", taskGlobalId),
  },
  approvalStepTemplates: {
    save: (templateGlobalId: string | undefined) =>
      formatActionLoader("approvalStepTemplates", "save", templateGlobalId),
  },
  delegations: {
    save: (delegationGlobalId: string | undefined) =>
      formatActionLoader("delegations", "save", delegationGlobalId),
  },
  dialogs: {
    confirm: () => formatActionLoader("dialogs", "confirm"),
    delete: () => formatActionLoader("dialogs", "delete"),
  },
  employees: {
    save: (employeeGlobalId: string | undefined) =>
      formatActionLoader("employees", "save", employeeGlobalId),
  },
  grids: {
    approvalStepTemplates: (tenantGlobalId: string | null | undefined) =>
      formatActionLoader("grids", "approvalStepTemplates", tenantGlobalId ?? undefined),
    delegations: (tenantGlobalId: string | null | undefined) =>
      formatActionLoader("grids", "delegations", tenantGlobalId ?? undefined),
    employees: (tenantGlobalId: string | null | undefined) =>
      formatActionLoader("grids", "employees", tenantGlobalId ?? undefined),
    inbox: (tenantGlobalId: string | null | undefined) =>
      formatActionLoader("grids", "inbox", tenantGlobalId ?? undefined),
    outbox: (tenantGlobalId: string | null | undefined) =>
      formatActionLoader("grids", "outbox", tenantGlobalId ?? undefined),
    teams: (tenantGlobalId: string | null | undefined) =>
      formatActionLoader("grids", "teams", tenantGlobalId ?? undefined),
    tenants: () => formatActionLoader("grids", "tenants"),
  },
  sharedVerificationLinks: {
    createForRequest: (approvalRequestGlobalId: string | undefined) =>
      formatActionLoader("sharedVerificationLinks", "createForRequest", approvalRequestGlobalId),
    createForTask: (approvalRequestTaskGlobalId: string | undefined) =>
      formatActionLoader("sharedVerificationLinks", "createForTask", approvalRequestTaskGlobalId),
    delete: (linkGlobalId: string | undefined) =>
      formatActionLoader("sharedVerificationLinks", "delete", linkGlobalId),
  },
  teams: {
    save: (teamGlobalId: string | undefined) =>
      formatActionLoader("teams", "save", teamGlobalId),
  },
  tenants: {
    save: (tenantGlobalId: string | undefined) =>
      formatActionLoader("tenants", "save", tenantGlobalId),
  },
  userProfile: {
    removeAvatar: () => formatActionLoader("userProfile", "removeAvatar"),
    save: () => formatActionLoader("userProfile", "save"),
  },
} as const;
