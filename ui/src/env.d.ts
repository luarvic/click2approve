/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URI: string;
  readonly VITE_EMAIL_SERVICE_IS_ENABLED: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
