interface RequestContext {
  getWorkEmployeeGlobalId: () => string | null;
  onWorkEmployeeInvalid: () => Promise<void>;
  onUnauthorized: () => void;
}

const defaultContext: RequestContext = {
  getWorkEmployeeGlobalId: () => null,
  onWorkEmployeeInvalid: async () => undefined,
  onUnauthorized: () => undefined,
};

let requestContext = defaultContext;

export const configureRequestContext = (context: RequestContext): void => {
  requestContext = context;
};

export const getRequestContext = (): RequestContext => requestContext;
