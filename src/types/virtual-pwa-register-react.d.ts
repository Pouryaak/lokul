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
