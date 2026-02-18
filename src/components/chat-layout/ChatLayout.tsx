/**
 * ChatLayout Component - Layout wrapper with sidebar and main content
 *
 * Provides the structural foundation for the routed chat interface.
 * Composes AppSidebar with a main content area for chat.
 *
 * Based on @blocks/sidebar-02 pattern from shadcn.
 */

import { useState } from "react";
import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/Button";
import { AppSidebar } from "./AppSidebar";
import { StatusIndicator } from "@/components/performance/StatusIndicator";
import { PerformancePanel } from "@/components/performance/PerformancePanel";
import { DownloadManager } from "@/components/model/DownloadManager";

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
  const [showPerformancePanel, setShowPerformancePanel] = useState(false);

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

      {/* Main content area */}
      <SidebarInset
        className={cn(
          "relative flex flex-col overflow-hidden",
          "bg-[#FFF8F0]", // Lokul warm cream background
          className
        )}
      >
        {/* Header - only performance button, no duplicate sidebar trigger */}
        <header className="flex h-14 items-center justify-end border-b border-gray-200/50 bg-white/50 px-4 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <DownloadManager />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPerformancePanel(!showPerformancePanel)}
              aria-label={
                showPerformancePanel ? "Hide performance panel" : "Show performance panel"
              }
              aria-pressed={showPerformancePanel}
            >
              <Activity className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-hidden">{children}</main>

        {/* Performance Panel - Right Side */}
        {showPerformancePanel && (
          <div className="absolute top-16 right-4 z-40">
            <PerformancePanel onClose={() => setShowPerformancePanel(false)} />
          </div>
        )}

        {/* Status Indicator - Bottom Left */}
        <StatusIndicator />
      </SidebarInset>
    </SidebarProvider>
  );
}

export default ChatLayout;
