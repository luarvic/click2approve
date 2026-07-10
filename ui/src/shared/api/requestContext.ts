interface RequestContext {
  getCurrentTenantId: () => number | null;
  onLoadingChange: (loader: string, delta: number) => void;
  onUnauthorized: () => void;
  tenantsAreEnabled: () => boolean;
}

const defaultContext: RequestContext = {
  getCurrentTenantId: () => null,
  onLoadingChange: () => undefined,
  onUnauthorized: () => undefined,
  tenantsAreEnabled: () => false,
};

let requestContext = defaultContext;

export const configureRequestContext = (context: RequestContext): void => {
  requestContext = context;
};

export const getRequestContext = (): RequestContext => requestContext;
