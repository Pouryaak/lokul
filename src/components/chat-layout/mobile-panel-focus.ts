export type MobilePanel = "none" | "sidebar" | "memory" | "performance" | "downloads";

type SetMobilePanel = (value: MobilePanel | ((current: MobilePanel) => MobilePanel)) => void;

export function createMobilePanelController(setMobilePanel: SetMobilePanel) {
  const openPanel = (panel: Exclude<MobilePanel, "none">) => {
    setMobilePanel(panel);
  };

  const closePanel = (panel?: Exclude<MobilePanel, "none">) => {
    if (!panel) {
      setMobilePanel("none");
      return;
    }

    setMobilePanel((current) => (current === panel ? "none" : current));
  };

  const togglePanel = (panel: Exclude<MobilePanel, "none">) => {
    setMobilePanel((current) => (current === panel ? "none" : panel));
  };

  return {
    openPanel,
    closePanel,
    togglePanel,
  };
}
