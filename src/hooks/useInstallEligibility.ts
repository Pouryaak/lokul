import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FIRST_SUCCESSFUL_CHAT_STORAGE_KEY,
  INSTALL_DISMISSED_SESSION_KEY,
  type BeforeInstallPromptEvent,
  type InstallPromptOutcome,
  type InstallState,
  type UseInstallEligibilityResult,
} from "@/types/pwa";

function getSessionSuppression(): boolean {
  try {
    return sessionStorage.getItem(INSTALL_DISMISSED_SESSION_KEY) === "1";
  } catch {
    return true;
  }
}

function getFirstSuccessfulChat(): boolean {
  try {
    return localStorage.getItem(FIRST_SUCCESSFUL_CHAT_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function isInstalledDisplayMode(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: window-controls-overlay)").matches ||
    window.navigator.standalone === true
  );
}

function computeInstallState(params: {
  isInstalled: boolean;
  hasPrompt: boolean;
  isSuppressedForSession: boolean;
  hasFirstSuccessfulChat: boolean;
}): InstallState {
  const { isInstalled, hasPrompt, isSuppressedForSession, hasFirstSuccessfulChat } = params;

  if (isInstalled) {
    return "installed";
  }

  if (!hasFirstSuccessfulChat || isSuppressedForSession || !hasPrompt) {
    return "hidden";
  }

  return "eligible";
}

export function useInstallEligibility(): UseInstallEligibilityResult {
  const [isInstalled, setIsInstalled] = useState(() => isInstalledDisplayMode());
  const [isSuppressedForSession, setIsSuppressedForSession] = useState(() =>
    getSessionSuppression()
  );
  const [hasFirstSuccessfulChat, setHasFirstSuccessfulChat] = useState(() =>
    getFirstSuccessfulChat()
  );
  const [hasPrompt, setHasPrompt] = useState(false);
  const [installState, setInstallState] = useState<InstallState>("hidden");
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: BeforeInstallPromptEvent) => {
      event.preventDefault();
      deferredPromptRef.current = event;
      setHasPrompt(true);
    };

    const handleInstalled = () => {
      deferredPromptRef.current = null;
      setHasPrompt(false);
      setIsInstalled(true);
      setInstallState("installed");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === FIRST_SUCCESSFUL_CHAT_STORAGE_KEY) {
        setHasFirstSuccessfulChat(event.newValue === "1");
      }
    };

    const handleFirstSuccessfulChat = () => {
      setHasFirstSuccessfulChat(true);
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("lokul:first-successful-chat", handleFirstSuccessfulChat);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("lokul:first-successful-chat", handleFirstSuccessfulChat);
    };
  }, []);

  useEffect(() => {
    setInstallState(
      computeInstallState({
        isInstalled,
        hasPrompt,
        isSuppressedForSession,
        hasFirstSuccessfulChat,
      })
    );
  }, [hasFirstSuccessfulChat, hasPrompt, isInstalled, isSuppressedForSession]);

  const promptInstall = useCallback(async (): Promise<InstallPromptOutcome> => {
    const deferredPrompt = deferredPromptRef.current;

    if (!deferredPrompt || installState !== "eligible") {
      return "unavailable";
    }

    setInstallState("prompted");
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPromptRef.current = null;
    setHasPrompt(false);

    if (outcome === "accepted") {
      return "accepted";
    }

    try {
      sessionStorage.setItem(INSTALL_DISMISSED_SESSION_KEY, "1");
    } catch {
      // Ignore storage failures, hidden fallback covers this case.
    }

    setIsSuppressedForSession(true);
    setInstallState("hidden");
    return "dismissed";
  }, [installState]);

  const isEligible = useMemo(() => installState === "eligible", [installState]);

  return {
    installState,
    isEligible,
    isInstalled,
    promptInstall,
  };
}
