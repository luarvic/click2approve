interface RequestContext {
  getWorkEmployeeGlobalId: () => string | null;
  onWorkEmployeeInvalid: () => Promise<void>;
  onUnauthorized: () => void;
  onTenantSuspended: (tenantGlobalId: string) => void;
}

const defaultContext: RequestContext = {
  getWorkEmployeeGlobalId: () => null,
  onWorkEmployeeInvalid: async () => undefined,
  onUnauthorized: () => undefined,
  onTenantSuspended: () => undefined,
};

let requestContext = defaultContext;

export const configureRequestContext = (context: RequestContext): void => {
  requestContext = context;
};

export const getRequestContext = (): RequestContext => requestContext;
