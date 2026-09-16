const tasksPath = "/tasks";
const userProfilePath = "/userProfile";
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const tenantPath = (tenantGlobalId: string, path: string): string => `/tenants/${tenantGlobalId}${path}`;
const applicationPath = (path: string): string => `${basePath}${path}`;

const userProfileTabPaths = {
  apiTokens: `${userProfilePath}/apiTokens`,
  notifications: `${userProfilePath}/notifications`,
  passkeys: `${userProfilePath}/passkeys`,
  profile: userProfilePath,
  signature: `${userProfilePath}/signature`,
} as const;

export type UserProfileTab = keyof typeof userProfileTabPaths;

const userProfileTabPath = (tab: UserProfileTab): string => userProfileTabPaths[tab];

export const Routes = {
  applicationPath,
  basePath,
  defaultPath: "/",
  tasksPath,
  tenantPath,
  userProfilePath,
  userProfileTabPath,
} as const;
