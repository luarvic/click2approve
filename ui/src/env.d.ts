/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URI: string;
  readonly VITE_APP_VERSION?: string;
  readonly VITE_SHOW_PERSISTENCE_SUCCESS_TOASTS?: string;
  readonly VITE_UI_BASE_URI: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
