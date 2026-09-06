const tasksPath = "/tasks";
const userProfilePath = "/userProfile";

const tenantPath = (tenantGlobalId: string, path: string): string => `/tenants/${tenantGlobalId}${path}`;

const userProfileTabPaths = {
  notifications: `${userProfilePath}/notifications`,
  passkeys: `${userProfilePath}/passkeys`,
  profile: userProfilePath,
  signature: `${userProfilePath}/signature`,
} as const;

export type UserProfileTab = keyof typeof userProfileTabPaths;

const userProfileTabPath = (tab: UserProfileTab): string => userProfileTabPaths[tab];

export const Routes = {
  defaultPath: "/",
  tasksPath,
  tenantPath,
  userProfilePath,
  userProfileTabPath,
} as const;
