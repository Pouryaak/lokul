export const FIRST_SUCCESSFUL_CHAT_STORAGE_KEY = "lokul:first-successful-chat";
export const INSTALL_DISMISSED_SESSION_KEY = "lokul:install-dismissed-session";

export type InstallState = "hidden" | "eligible" | "prompted" | "installed";

export type InstallPromptOutcome = "accepted" | "dismissed" | "unavailable";

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  prompt: () => Promise<void>;
}

export interface UseInstallEligibilityResult {
  installState: InstallState;
  isEligible: boolean;
  isInstalled: boolean;
  promptInstall: () => Promise<InstallPromptOutcome>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
    appinstalled: Event;
  }

  interface Navigator {
    standalone?: boolean;
  }
}

export {};
