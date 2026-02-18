/**
 * ChatLayout Component - Layout wrapper with sidebar and main content
 *
 * Provides the structural foundation for the routed chat interface.
 * Composes AppSidebar with a main content area for chat.
 *
 * Based on @blocks/sidebar-02 pattern from shadcn.
 */

import { cn } from "@/lib/utils";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";

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
      <AppSidebar onNewChat={onNewChat} onSettingsClick={onSettingsClick} />

      {/* Main content area */}
      <SidebarInset
        className={cn(
          "flex flex-col overflow-hidden",
          "bg-[#FFF8F0]", // Lokul warm cream background
          className
        )}
      >
        {/* Header with sidebar trigger (visible when sidebar collapsed) */}
        <header className="flex h-14 items-center gap-4 border-b border-gray-200/50 bg-white/50 px-4 backdrop-blur-sm">
          <SidebarTrigger className="md:hidden" />
          <SidebarTrigger className="hidden md:flex" />
          <div className="flex-1" />
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-hidden">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default ChatLayout;
