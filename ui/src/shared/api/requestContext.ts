interface RequestContext {
  onLoadingChange: (loader: string, delta: number) => void;
  onUnauthorized: () => void;
}

const defaultContext: RequestContext = {
  onLoadingChange: () => undefined,
  onUnauthorized: () => undefined,
};

let requestContext = defaultContext;

export const configureRequestContext = (context: RequestContext): void => {
  requestContext = context;
};

export const getRequestContext = (): RequestContext => requestContext;
