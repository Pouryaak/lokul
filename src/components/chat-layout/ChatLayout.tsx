/**
 * ChatLayout Component - Layout wrapper with sidebar and main content
 *
 * Provides the structural foundation for the routed chat interface.
 * Composes AppSidebar with a main content area for chat.
 *
 * Based on @blocks/sidebar-02 pattern from shadcn.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PanelLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { SidebarInset, SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/Button";
import { AppSidebar } from "./AppSidebar";
import { ChatTopbarMenu } from "./chat-topbar-menu";
import { CompactChatHeader } from "./compact-chat-header";
import { createMobilePanelController, type MobilePanel } from "./mobile-panel-focus";
import { PerformanceButton } from "@/components/performance/PerformanceButton";
import { DownloadManager } from "@/components/model/DownloadManager";
import { MemoryButton } from "@/components/memory/MemoryButton";
import { useMemory } from "@/hooks/useMemory";
import { useGlobalShortcuts } from "@/hooks/useGlobalShortcuts";
import { useConversationModelStore } from "@/store/conversationModelStore";

const CHAT_NOISE_BACKGROUND_IMAGE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220' viewBox='0 0 220 220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)' opacity='0.9'/%3E%3C/svg%3E\")";

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
      className="relative h-screen overflow-hidden bg-[var(--chat-shell-bg)]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[var(--chat-shell-bg)]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.14] mix-blend-screen"
        style={{
          backgroundImage: CHAT_NOISE_BACKGROUND_IMAGE,
          backgroundRepeat: "repeat",
          backgroundSize: "220px 220px",
        }}
      />

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
  const navigate = useNavigate();
  const { count } = useMemory();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>("none");
  const mobileController = useMemo(() => createMobilePanelController(setMobilePanel), []);
  const { isMobile, openMobile, setOpenMobile } = useSidebar();
  const isDownloadPanelOpen = useConversationModelStore((state) => state.isDownloadManagerOpen);
  const closeDownloadPanel = useConversationModelStore((state) => state.closeDownloadManager);
  const previousOpenMobileRef = useRef(openMobile);
  const previousDownloadOpenRef = useRef(isDownloadPanelOpen);

  // Global keyboard shortcuts
  useGlobalShortcuts({
    onSearch: () => setSearchOpen(true),
    onNewChat: () => navigate("/chat"),
    onEscape: () => {
      if (searchOpen) {
        setSearchOpen(false);
      }
    },
    searchOpen,
    dialogOpen: false,
    sheetOpen: isDownloadPanelOpen,
  });

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
    if (!isMobile) {
      setMobilePanel("none");
      setMobileSidebarOpen(false);
      return;
    }

    if (mobilePanel === "sidebar") {
      setMobileSidebarOpen(true);
      closeDownloadPanel();
      return;
    }

    if (mobilePanel === "downloads") {
      setMobileSidebarOpen(false);
      return;
    }

    // When mobilePanel is "none", don't close the download panel
    setMobileSidebarOpen(false);
  }, [
    closeDownloadPanel,
    isMobile,
    mobilePanel,
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
      previousDownloadOpenRef.current &&
      !isDownloadPanelOpen &&
      mobilePanel === "downloads"
    ) {
      mobileController.closePanel("downloads");
    }

    previousDownloadOpenRef.current = isDownloadPanelOpen;
  }, [isDownloadPanelOpen, isMobile, mobileController, mobilePanel]);

  const handleSidebarClick = () => {
    mobileController.togglePanel("sidebar");
  };

  return (
    <SidebarInset
      className={cn(
        "chat-surface relative flex flex-col overflow-hidden",
        "bg-[var(--chat-surface-bg)]",
        className
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-screen"
        style={{
          backgroundImage: CHAT_NOISE_BACKGROUND_IMAGE,
          backgroundRepeat: "repeat",
          backgroundSize: "220px 220px",
        }}
      />
      <CompactChatHeader
        className="relative z-10"
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
            <MemoryButton count={count} />
          </>
        }
        rightActions={
          <>
            <PerformanceButton />
            <DownloadManager />
            {activeConversationId ? <ChatTopbarMenu conversationId={activeConversationId} /> : null}
          </>
        }
      />

      <main className="relative z-10 flex-1 overflow-hidden">{children}</main>
    </SidebarInset>
  );
}

export default ChatLayout;
