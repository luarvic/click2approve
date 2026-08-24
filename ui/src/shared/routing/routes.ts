const tasksPath = "/tasks";

const tenantPath = (tenantGlobalId: string, path: string): string => `/tenants/${tenantGlobalId}${path}`;

export const Routes = {
  defaultPath: "/",
  tasksPath,
  tenantPath,
} as const;
