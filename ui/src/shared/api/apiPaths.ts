export const ApiPaths = {
  account: {
    confirmEmail: "api/v1/account/confirmEmail",
    forgotPassword: "api/v1/account/forgotPassword",
    login: "api/v1/account/login",
    manageInfo: "api/v1/account/manage/info",
    refresh: "api/v1/account/refresh",
    register: "api/v1/account/register",
    resendConfirmationEmail: "api/v1/account/resendConfirmationEmail",
    resetPassword: "api/v1/account/resetPassword",
  },
  products: {
    info: "api/v1/products/info",
  },
  publicReceipts: {
    byId: (receiptGlobalId: string) => `api/v1/publicReceipts/${receiptGlobalId}`,
    root: "api/v1/publicReceipts/",
  },
  tenants: {
    approvalStepTemplates: (tenantGlobalId: string) => `api/v1/tenants/${tenantGlobalId}/approvalStepTemplates`,
    approvalStepTemplate: (tenantGlobalId: string, templateGlobalId: string) =>
      `api/v1/tenants/${tenantGlobalId}/approvalStepTemplates/${templateGlobalId}`,
    current: "api/v1/tenants/current",
    byId: (tenantGlobalId: string) => `api/v1/tenants/${tenantGlobalId}`,
    delegation: (tenantGlobalId: string, delegationGlobalId: string) =>
      `api/v1/tenants/${tenantGlobalId}/delegations/${delegationGlobalId}`,
    delegations: (tenantGlobalId: string) => `api/v1/tenants/${tenantGlobalId}/delegations`,
    discussionMessageFile: (tenantGlobalId: string, messageGlobalId: string, fileGlobalId: string) =>
      `api/v1/tenants/${tenantGlobalId}/discussions/messages/${messageGlobalId}/files/${fileGlobalId}/downloadBase64`,
    requestDiscussion: (tenantGlobalId: string, requestGlobalId: string) =>
      `api/v1/tenants/${tenantGlobalId}/discussions/requests/${requestGlobalId}`,
    taskDiscussion: (tenantGlobalId: string, taskGlobalId: string) =>
      `api/v1/tenants/${tenantGlobalId}/discussions/tasks/${taskGlobalId}`,
    employee: (tenantGlobalId: string, employeeGlobalId: string) =>
      `api/v1/tenants/${tenantGlobalId}/employees/${employeeGlobalId}`,
    employees: (tenantGlobalId: string) => `api/v1/tenants/${tenantGlobalId}/employees`,
    file: (tenantGlobalId: string, fileGlobalId: string) => `api/v1/tenants/${tenantGlobalId}/files/${fileGlobalId}`,
    fileDownload: (tenantGlobalId: string, fileGlobalId: string) =>
      `api/v1/tenants/${tenantGlobalId}/files/${fileGlobalId}/downloadBase64`,
    fileUpload: (tenantGlobalId: string) => `api/v1/tenants/${tenantGlobalId}/files/upload`,
    notificationMarkRead: (tenantGlobalId: string, notificationGlobalId: string) =>
      `api/v1/tenants/${tenantGlobalId}/notifications/${notificationGlobalId}/read`,
    notifications: (tenantGlobalId: string) => `api/v1/tenants/${tenantGlobalId}/notifications`,
    notificationsReadSelected: (tenantGlobalId: string) =>
      `api/v1/tenants/${tenantGlobalId}/notifications/readSelected`,
    unreadNotificationCount: (tenantGlobalId: string) => `api/v1/tenants/${tenantGlobalId}/notifications/unread/count`,
    logo: (tenantGlobalId: string) => `api/v1/tenants/${tenantGlobalId}/logo`,
    receipt: (tenantGlobalId: string, receiptGlobalId: string) =>
      `api/v1/tenants/${tenantGlobalId}/receipts/${receiptGlobalId}`,
    receiptLink: (tenantGlobalId: string, receiptGlobalId: string, linkGlobalId: string) =>
      `api/v1/tenants/${tenantGlobalId}/receipts/${receiptGlobalId}/links/${linkGlobalId}`,
    receiptLinks: (tenantGlobalId: string, receiptGlobalId: string) =>
      `api/v1/tenants/${tenantGlobalId}/receipts/${receiptGlobalId}/links`,
    receipts: (tenantGlobalId: string) => `api/v1/tenants/${tenantGlobalId}/receipts`,
    request: (tenantGlobalId: string, requestGlobalId: string) =>
      `api/v1/tenants/${tenantGlobalId}/requests/${requestGlobalId}`,
    requestAttachmentDownload: (tenantGlobalId: string, requestGlobalId: string, attachmentGlobalId: string) =>
      `api/v1/tenants/${tenantGlobalId}/requests/${requestGlobalId}/attachments/${attachmentGlobalId}/downloadBase64`,
    requestCancel: (tenantGlobalId: string, requestGlobalId: string) =>
      `api/v1/tenants/${tenantGlobalId}/requests/${requestGlobalId}/cancel`,
    requestResubmit: (tenantGlobalId: string, requestGlobalId: string) =>
      `api/v1/tenants/${tenantGlobalId}/requests/${requestGlobalId}/resubmit`,
    requests: (tenantGlobalId: string) => `api/v1/tenants/${tenantGlobalId}/requests`,
    root: "api/v1/tenants",
    task: (tenantGlobalId: string, taskGlobalId: string) => `api/v1/tenants/${tenantGlobalId}/tasks/${taskGlobalId}`,
    taskAttachment: (tenantGlobalId: string, taskGlobalId: string, attachmentGlobalId: string) =>
      `api/v1/tenants/${tenantGlobalId}/tasks/${taskGlobalId}/attachments/${attachmentGlobalId}`,
    taskAttachmentDownload: (tenantGlobalId: string, taskGlobalId: string, attachmentGlobalId: string) =>
      `api/v1/tenants/${tenantGlobalId}/tasks/${taskGlobalId}/attachments/${attachmentGlobalId}/downloadBase64`,
    taskAttachments: (tenantGlobalId: string, taskGlobalId: string) =>
      `api/v1/tenants/${tenantGlobalId}/tasks/${taskGlobalId}/attachments`,
    taskComplete: (tenantGlobalId: string) => `api/v1/tenants/${tenantGlobalId}/tasks/complete`,
    taskRequestAttachmentDownload: (tenantGlobalId: string, taskGlobalId: string, attachmentGlobalId: string) =>
      `api/v1/tenants/${tenantGlobalId}/tasks/${taskGlobalId}/requestAttachments/${attachmentGlobalId}/downloadBase64`,
    tasks: (tenantGlobalId: string) => `api/v1/tenants/${tenantGlobalId}/tasks`,
    uncompletedTaskCount: (tenantGlobalId: string) => `api/v1/tenants/${tenantGlobalId}/tasks/uncompleted/count`,
    team: (tenantGlobalId: string, teamGlobalId: string) => `api/v1/tenants/${tenantGlobalId}/teams/${teamGlobalId}`,
    teams: (tenantGlobalId: string) => `api/v1/tenants/${tenantGlobalId}/teams`,
    withLogo: "api/v1/tenants/withLogo",
  },
  userProfiles: {
    avatar: "api/v1/userProfiles/avatar",
    root: "api/v1/userProfiles",
  },
} as const;
