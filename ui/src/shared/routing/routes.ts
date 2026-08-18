const inboxPath = "/inbox";

const tenantPath = (tenantGlobalId: string, path: string): string => `/tenants/${tenantGlobalId}${path}`;

export const Routes = {
  defaultPath: "/",
  inboxPath,
  tenantPath,
} as const;
