/* @vitest-environment jsdom */

import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";

const memoryStoreState = {
  isPanelOpen: false,
  openPanel: vi.fn(() => {
    memoryStoreState.isPanelOpen = true;
  }),
  closePanel: vi.fn(() => {
    memoryStoreState.isPanelOpen = false;
  }),
  togglePanel: vi.fn(() => {
    memoryStoreState.isPanelOpen = !memoryStoreState.isPanelOpen;
  }),
};

const conversationModelStoreState = {
  isDownloadManagerOpen: false,
  closeDownloadManager: vi.fn(() => {
    conversationModelStoreState.isDownloadManagerOpen = false;
  }),
};

vi.mock("react-router-dom", () => ({
  useParams: () => ({ id: "conversation-1" }),
  useNavigate: () => vi.fn(),
}));

vi.mock("@/hooks/useConversations", () => ({
  useConversations: () => ({
    conversations: [],
    isLoading: false,
  }),
}));

vi.mock("./AppSidebar", async () => {
  const actual =
    await vi.importActual<typeof import("@/components/ui/sidebar")>("@/components/ui/sidebar");

  return {
    AppSidebar: () => {
      const { isMobile, openMobile } = actual.useSidebar();
      return <div data-testid="sidebar-state">{`${isMobile}:${openMobile}`}</div>;
    },
  };
});

vi.mock("@/hooks/useMemory", () => ({
  useMemory: () => ({ count: 0 }),
}));

vi.mock("@/store/memoryStore", () => ({
  useMemoryStore: (selector: (state: typeof memoryStoreState) => unknown) =>
    selector(memoryStoreState),
}));

vi.mock("@/store/conversationModelStore", () => ({
  useConversationModelStore: (selector: (state: typeof conversationModelStoreState) => unknown) =>
    selector(conversationModelStoreState),
}));

vi.mock("@/components/memory/MemoryHeaderPill", () => ({
  MemoryHeaderPill: ({ onClick }: { onClick: () => void }) => (
    <button aria-label="Toggle memory panel" onClick={onClick} type="button">
      Memory
    </button>
  ),
}));

vi.mock("@/components/memory/MemoryPanel", () => ({
  MemoryPanel: ({ open }: { open: boolean }) => (
    <div data-testid="memory-panel">{String(open)}</div>
  ),
}));

vi.mock("@/components/model/DownloadManager", () => ({
  DownloadManager: () => <div data-testid="download-manager" />,
}));

vi.mock("@/components/performance/StatusIndicator", () => ({
  StatusIndicator: () => <span data-testid="status-indicator" />,
}));

vi.mock("@/components/performance/PerformancePanel", () => ({
  PerformancePanel: () => <div data-testid="performance-panel" />,
}));

vi.mock("./chat-topbar-menu", () => ({
  ChatTopbarMenu: () => <div data-testid="chat-topbar-menu" />,
}));

vi.mock("./compact-chat-header", () => ({
  CompactChatHeader: ({
    leftActions,
    rightActions,
  }: {
    leftActions: ReactNode;
    rightActions: ReactNode;
  }) => (
    <header>
      <div>{leftActions}</div>
      <div>{rightActions}</div>
    </header>
  ),
}));

import { ChatLayout } from "./ChatLayout";

describe("ChatLayout mobile sidebar regression", () => {
  it("repeatedly toggles mobile drawer without recursive update errors", async () => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      writable: true,
      value: 375,
    });
    window.matchMedia = vi.fn().mockImplementation(() => ({
      matches: true,
      media: "(max-width: 767px)",
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    render(
      <ChatLayout>
        <div>Chat content</div>
      </ChatLayout>
    );

    for (let index = 0; index < 12; index += 1) {
      const sidebarToggle = screen.getByRole("button", { name: /conversation drawer/i });
      fireEvent.click(sidebarToggle);
      fireEvent.click(screen.getByRole("button", { name: /conversation drawer/i }));
    }

    expect(screen.getByTestId("sidebar-state").textContent).toContain("true");

    fireEvent.click(screen.getByRole("button", { name: /open conversation drawer/i }));
    fireEvent.click(screen.getByRole("button", { name: /toggle memory panel/i }));
    expect(memoryStoreState.openPanel).toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: /show performance panel/i }));
    expect(conversationModelStoreState.closeDownloadManager).toHaveBeenCalled();

    const maximumDepthErrors = consoleErrorSpy.mock.calls
      .flat()
      .filter((entry) => String(entry).includes("Maximum update depth exceeded"));

    expect(maximumDepthErrors).toHaveLength(0);

    consoleErrorSpy.mockRestore();
  });
});
