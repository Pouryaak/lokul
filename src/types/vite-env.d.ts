/**
 * Vite Environment Type Definitions
 *
 * Type declarations for Vite's import.meta.env API.
 */

/**
 * Import meta env interface
 */
interface ImportMetaEnv {
  /** Whether the app is running in development mode */
  readonly DEV: boolean;

  /** Whether the app is running in production mode */
  readonly PROD: boolean;

  /** The base URL of the app */
  readonly BASE_URL: string;

  /** The mode the app is running in */
  readonly MODE: string;

  /** Whether SSR is enabled */
  readonly SSR: boolean;
}

declare module "virtual:pwa-register/react" {
  import type { Dispatch, SetStateAction } from "react";

  interface RegisterSWOptions {
    immediate?: boolean;
    onNeedRefresh?: () => void;
    onOfflineReady?: () => void;
    onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void;
    onRegisteredSW?: (
      swScriptUrl: string,
      registration: ServiceWorkerRegistration | undefined
    ) => void;
    onRegisterError?: (error: Error) => void;
  }

  interface UseRegisterSWReturn {
    needRefresh: [boolean, Dispatch<SetStateAction<boolean>>];
    offlineReady: [boolean, Dispatch<SetStateAction<boolean>>];
    updateServiceWorker: (reloadPage?: boolean) => Promise<void>;
  }

  export function useRegisterSW(options?: RegisterSWOptions): UseRegisterSWReturn;
}

/**
 * Augment ImportMeta with env property
 */
declare global {
  interface ImportMeta {
    /** Environment variables */
    readonly env: ImportMetaEnv;
  }
}

export {};
