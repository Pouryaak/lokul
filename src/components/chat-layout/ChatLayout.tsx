/**
 * ChatLayout Component - Layout wrapper with sidebar and main content
 *
 * Provides the structural foundation for the routed chat interface.
 * Composes AppSidebar with a main content area for chat.
 *
 * Based on @blocks/sidebar-02 pattern from shadcn.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Activity, PanelLeft } from "lucide-react";
import { useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { SidebarInset, SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/Button";
import { AppSidebar } from "./AppSidebar";
import { ChatTopbarMenu } from "./chat-topbar-menu";
import { CompactChatHeader } from "./compact-chat-header";
import { createMobilePanelController, type MobilePanel } from "./mobile-panel-focus";
import { StatusIndicator } from "@/components/performance/StatusIndicator";
import { PerformancePanel } from "@/components/performance/PerformancePanel";
import { DownloadManager } from "@/components/model/DownloadManager";
import { MemoryHeaderPill } from "@/components/memory/MemoryHeaderPill";
import { MemoryPanel } from "@/components/memory/MemoryPanel";
import { useMemory } from "@/hooks/useMemory";
import { useConversationModelStore } from "@/store/conversationModelStore";
import { useMemoryStore } from "@/store/memoryStore";

/**
 * Props for the ChatLayout component
 */
interface ChatLayoutProps {
  /** Main content to render in the chat area */
  children: React.ReactNode;
  /** Callback when new chat button is clicked */
  onNewChat?: () => void;
  /** Callback when settings is clicked */
  onSettingsClick?: () => void;
  /** Callback when a conversation is clicked in sidebar - passes conversation ID */
  onConversationClick?: (id: string) => void;
  /** Optional additional className */
  className?: string;
  /** Whether the sidebar is open by default */
  defaultOpen?: boolean;
  /** Controlled open state */
  open?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
}

/**
 * ChatLayout component
 *
 * Wraps the chat interface with a collapsible sidebar and main content area.
 * Uses shadcn SidebarProvider for state management.
 *
 * @example
 * ```tsx
 * <ChatLayout
 *   onNewChat={() => createNewConversation()}
 *   onSettingsClick={() => openSettings()}
 * >
 *   <ChatInterface />
 * </ChatLayout>
 * ```
 */
export function ChatLayout({
  children,
  onNewChat,
  onSettingsClick,
  onConversationClick,
  className,
  defaultOpen = true,
  open,
  onOpenChange,
}: ChatLayoutProps) {
  return (
    <SidebarProvider
      defaultOpen={defaultOpen}
      open={open}
      onOpenChange={onOpenChange}
      className="h-screen"
    >
      {/* App Sidebar with conversation list */}
      <AppSidebar
        onNewChat={onNewChat}
        onSettingsClick={onSettingsClick}
        onConversationClick={onConversationClick}
      />

      <ChatLayoutContent className={className}>{children}</ChatLayoutContent>
    </SidebarProvider>
  );
}

function ChatLayoutContent({
  children,
  className,
}: Pick<ChatLayoutProps, "children" | "className">) {
  const { id: activeConversationId } = useParams<{ id: string }>();
  const { count } = useMemory();
  const [showPerformancePanel, setShowPerformancePanel] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>("none");
  const mobileController = useMemo(() => createMobilePanelController(setMobilePanel), []);
  const { isMobile, openMobile, setOpenMobile } = useSidebar();
  const isMemoryPanelOpen = useMemoryStore((state) => state.isPanelOpen);
  const openMemoryPanel = useMemoryStore((state) => state.openPanel);
  const closeMemoryPanel = useMemoryStore((state) => state.closePanel);
  const toggleMemoryPanel = useMemoryStore((state) => state.togglePanel);
  const isDownloadPanelOpen = useConversationModelStore((state) => state.isDownloadManagerOpen);
  const closeDownloadPanel = useConversationModelStore((state) => state.closeDownloadManager);
  const previousOpenMobileRef = useRef(openMobile);
  const previousMemoryOpenRef = useRef(isMemoryPanelOpen);
  const previousPerformanceOpenRef = useRef(showPerformancePanel);
  const previousDownloadOpenRef = useRef(isDownloadPanelOpen);

  const setMobileSidebarOpen = useCallback(
    (nextOpen: boolean) => {
      if (openMobile === nextOpen) {
        return;
      }

      setOpenMobile(nextOpen);
    },
    [openMobile, setOpenMobile]
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === "m") {
        event.preventDefault();
        if (isMobile) {
          mobileController.togglePanel("memory");
          return;
        }
        toggleMemoryPanel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobile, mobileController, toggleMemoryPanel]);

  useEffect(() => {
    if (!isMobile) {
      setMobilePanel("none");
      setMobileSidebarOpen(false);
      return;
    }

    if (mobilePanel === "sidebar") {
      setMobileSidebarOpen(true);
      closeMemoryPanel();
      setShowPerformancePanel(false);
      closeDownloadPanel();
      return;
    }

    if (mobilePanel === "memory") {
      setMobileSidebarOpen(false);
      openMemoryPanel();
      setShowPerformancePanel(false);
      closeDownloadPanel();
      return;
    }

    if (mobilePanel === "performance") {
      setMobileSidebarOpen(false);
      closeMemoryPanel();
      setShowPerformancePanel(true);
      closeDownloadPanel();
      return;
    }

    if (mobilePanel === "downloads") {
      setMobileSidebarOpen(false);
      closeMemoryPanel();
      setShowPerformancePanel(false);
      return;
    }

    setMobileSidebarOpen(false);
    closeMemoryPanel();
    setShowPerformancePanel(false);
    closeDownloadPanel();
  }, [
    closeDownloadPanel,
    closeMemoryPanel,
    isMobile,
    mobilePanel,
    openMemoryPanel,
    setMobileSidebarOpen,
  ]);

  useEffect(() => {
    if (isMobile && isDownloadPanelOpen && mobilePanel !== "downloads") {
      mobileController.openPanel("downloads");
    }
  }, [isDownloadPanelOpen, isMobile, mobileController, mobilePanel]);

  useEffect(() => {
    if (isMobile && previousOpenMobileRef.current && !openMobile && mobilePanel === "sidebar") {
      mobileController.closePanel("sidebar");
    }

    previousOpenMobileRef.current = openMobile;
  }, [isMobile, mobileController, mobilePanel, openMobile]);

  useEffect(() => {
    if (
      isMobile &&
      previousMemoryOpenRef.current &&
      !isMemoryPanelOpen &&
      mobilePanel === "memory"
    ) {
      mobileController.closePanel("memory");
    }

    previousMemoryOpenRef.current = isMemoryPanelOpen;
  }, [isMemoryPanelOpen, isMobile, mobileController, mobilePanel]);

  useEffect(() => {
    if (
      isMobile &&
      previousPerformanceOpenRef.current &&
      !showPerformancePanel &&
      mobilePanel === "performance"
    ) {
      mobileController.closePanel("performance");
    }

    previousPerformanceOpenRef.current = showPerformancePanel;
  }, [isMobile, mobileController, mobilePanel, showPerformancePanel]);

  useEffect(() => {
    if (
      isMobile &&
      previousDownloadOpenRef.current &&
      !isDownloadPanelOpen &&
      mobilePanel === "downloads"
    ) {
      mobileController.closePanel("downloads");
    }

    previousDownloadOpenRef.current = isDownloadPanelOpen;
  }, [isDownloadPanelOpen, isMobile, mobileController, mobilePanel]);

  const handleMemoryClick = () => {
    if (isMobile) {
      mobileController.togglePanel("memory");
      return;
    }
    toggleMemoryPanel();
  };

  const handlePerformanceClick = () => {
    if (isMobile) {
      mobileController.togglePanel("performance");
      return;
    }
    setShowPerformancePanel((current) => !current);
  };

  const handleSidebarClick = () => {
    mobileController.togglePanel("sidebar");
  };

  return (
    <SidebarInset
      className={cn(
        "relative flex flex-col overflow-hidden",
        "bg-[#FFF8F0]", // Lokul warm cream background
        className
      )}
    >
      <CompactChatHeader
        leftActions={
          <>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 md:hidden"
              onClick={handleSidebarClick}
              aria-label={openMobile ? "Close conversation drawer" : "Open conversation drawer"}
            >
              <PanelLeft className="h-4 w-4" />
            </Button>
            <MemoryHeaderPill count={count} onClick={handleMemoryClick} />
          </>
        }
        rightActions={
          <>
            <StatusIndicator />
            <DownloadManager />
            <Button
              variant="outline"
              size="sm"
              onClick={handlePerformanceClick}
              aria-label={
                showPerformancePanel ? "Hide performance panel" : "Show performance panel"
              }
              aria-pressed={showPerformancePanel}
            >
              <Activity className="h-4 w-4" />
            </Button>
            {activeConversationId ? <ChatTopbarMenu conversationId={activeConversationId} /> : null}
          </>
        }
      />

      <main className="flex-1 overflow-hidden">{children}</main>

      {showPerformancePanel && (
        <div className="absolute top-16 right-4 z-40">
          <PerformancePanel onClose={() => setShowPerformancePanel(false)} />
        </div>
      )}
      <MemoryPanel open={isMemoryPanelOpen} onClose={closeMemoryPanel} />
    </SidebarInset>
  );
}

export default ChatLayout;
