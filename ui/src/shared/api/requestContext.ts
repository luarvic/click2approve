interface RequestContext {
  getWorkEmployeeGlobalId: () => string | null;
  onTenantAccessRevoked: () => Promise<void>;
  onWorkEmployeeInvalid: () => Promise<void>;
  onUnauthorized: () => void;
  onTenantSuspended: (tenantGlobalId: string) => void;
}

const defaultContext: RequestContext = {
  getWorkEmployeeGlobalId: () => null,
  onTenantAccessRevoked: async () => undefined,
  onWorkEmployeeInvalid: async () => undefined,
  onUnauthorized: () => undefined,
  onTenantSuspended: () => undefined,
};

let requestContext = defaultContext;

export const configureRequestContext = (context: RequestContext): void => {
  requestContext = context;
};

export const getRequestContext = (): RequestContext => requestContext;
