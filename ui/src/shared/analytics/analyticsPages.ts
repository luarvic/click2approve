export interface AnalyticsPage {
  path: string;
  title: string;
}

// Only these route templates leave the app. Never send resource IDs or unknown URL segments.
const screens: [string, string][] = [
  ["/", "App home"],
  ["/signIn", "Sign in"],
  ["/signUp", "Sign up"],
  ["/forgotPassword", "Forgot password"],
  ["/resetPassword", "Reset password"],
  ["/resendConfirmationEmail", "Resend confirmation"],
  ["/confirmEmail", "Confirm email"],
  ["/passwordResetComplete", "Password reset complete"],
  ["/confirmationEmailSent", "Confirmation email sent"],
  ["/passwordResetEmailSent", "Password reset email sent"],
  ["/receipt-verification/:link", "Public receipt"],
  ["/userProfile", "Profile"],
  ...["security", "passkeys", "apiTokens", "signature", "notifications"].map((tab): [string, string] => [
    `/userProfile/${tab}`,
    `Profile ${tab}`,
  ]),
  ["/tenants", "Organizations"],
  ["/tenants/new", "New organization"],
  ["/tenants/new/plans", "Organization plan selection"],
  ["/tenants/:tenant", "Organization settings"],
  ...[
    "tasks",
    "notifications",
    "receipts",
    "plans",
    "retention",
    "usage",
    "requests",
    "approvalStepTemplates",
    "teams",
    "employees",
    "delegations",
  ].map((screen): [string, string] => [`/tenants/:tenant/${screen}`, screen]),
  ["/tenants/:tenant/requests/new", "New request"],
  ["/tenants/:tenant/requests/new/compose", "Compose request"],
  ["/tenants/:tenant/requests/:request", "Request"],
  ["/tenants/:tenant/requests/:request/resubmit", "Resubmit request"],
  ["/tenants/:tenant/requests/:request/chat", "Request discussion"],
  ["/tenants/:tenant/tasks/:task", "Task"],
  ["/tenants/:tenant/tasks/:task/workflow", "Task workflow"],
  ["/tenants/:tenant/tasks/:task/chat", "Task discussion"],
  ["/tenants/:tenant/receipts/:receipt", "Receipt"],
  ["/tenants/:tenant/receipts/:receipt/share", "Receipt sharing"],
  ...["teams", "employees", "delegations", "approvalStepTemplates"].flatMap((resource): [string, string][] => [
    [`/tenants/:tenant/${resource}/new`, `New ${resource}`],
    [`/tenants/:tenant/${resource}/:resource`, resource],
  ]),
];

export function appAnalyticsPage(pathname: string, basePath = "/app"): AnalyticsPage {
  const path = pathname.split(/[?#]/)[0].replace(/\/$/, "") || "/";
  const relative = path === basePath ? "/" : path.startsWith(`${basePath}/`) ? path.slice(basePath.length) : "";
  const screen = screens.find(([pattern]) => {
    const expression = pattern
      .split("/")
      .map((part) => (part.startsWith(":") ? "[^/]+" : part))
      .join("/");
    return new RegExp(`^${expression}$`).test(relative);
  });
  return screen
    ? { path: `${basePath}${screen[0] === "/" ? "/" : screen[0]}`, title: screen[1] }
    : { path: `${basePath}/other`, title: "Other app screen" };
}
