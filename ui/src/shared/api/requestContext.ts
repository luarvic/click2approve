interface RequestContext {
  onUnauthorized: () => void;
}

const defaultContext: RequestContext = {
  onUnauthorized: () => undefined,
};

let requestContext = defaultContext;

export const configureRequestContext = (context: RequestContext): void => {
  requestContext = context;
};

export const getRequestContext = (): RequestContext => requestContext;
