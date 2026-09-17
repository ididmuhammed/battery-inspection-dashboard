/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GATEWAY_WS?: string;
  readonly VITE_USE_LIVE_FEED?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
