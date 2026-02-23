"use client";

import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useConversations } from "@/hooks/useConversations";
import { useConversationActions } from "@/hooks/useConversationActions";
import type { Conversation } from "@/types/index";
import {
  ConversationItem,
  EmptyState,
  LoadingState,
  NewChatItem,
  SearchButton,
  SettingsButton,
  SidebarLogo,
} from "./app-sidebar-parts";
import { SearchCommand } from "./SearchCommand";

interface AppSidebarProps {
  onNewChat?: () => void;
  onSettingsClick?: () => void;
  onConversationClick?: (id: string) => void;
  className?: string;
}

function SidebarHeaderContent({ isCollapsed }: { isCollapsed: boolean }) {
  return (
    <SidebarHeader
      className={cn(
        "flex md:pt-3.5",
        isCollapsed
          ? "flex-row items-center justify-between gap-y-4 md:flex-col md:items-start md:justify-start"
          : "flex-row items-center justify-between"
      )}
    >
      <a href="/" className="flex items-center gap-2">
        <SidebarLogo className="h-8 w-8" />
      </a>

      <motion.div
        key={isCollapsed ? "header-collapsed" : "header-expanded"}
        className={cn(
          "flex items-center",
          isCollapsed ? "flex-row md:flex-col-reverse" : "flex-row"
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <SidebarTrigger />
      </motion.div>
    </SidebarHeader>
  );
}

interface ConversationSectionProps {
  conversations: Conversation[];
  isCollapsed: boolean;
  isLoading: boolean;
  currentConversationId?: string;
  onNewChat: () => void;
  onSearch: () => void;
  onConversationClick: (id: string) => void;
  onRename: (id: string, newTitle: string) => Promise<void>;
}

const CONVERSATION_LAYOUT_TRANSITION = {
  type: "spring",
  stiffness: 420,
  damping: 36,
  mass: 0.3,
} as const;

function ConversationSection({
  conversations,
  isCollapsed,
  isLoading,
  currentConversationId,
  onNewChat,
  onSearch,
  onConversationClick,
  onRename,
}: ConversationSectionProps) {
  return (
    <SidebarContent className="lokul-dark-scrollbar gap-4 px-2 py-4">
      <SearchButton onClick={onSearch} isCollapsed={isCollapsed} />
      <NewChatItem onClick={onNewChat} isCollapsed={isCollapsed} />
      {!isCollapsed && <p className="px-3 text-xs font-medium text-muted-foreground">Conversations</p>}

      {isLoading ? (
        <LoadingState isCollapsed={isCollapsed} />
      ) : conversations.length === 0 ? (
        <EmptyState isCollapsed={isCollapsed} />
      ) : (
        <motion.div layout className="space-y-1">
          {conversations.map((conversation) => (
            <motion.div key={conversation.id} layout transition={CONVERSATION_LAYOUT_TRANSITION}>
              <ConversationItem
                conversation={conversation}
                isActive={conversation.id === currentConversationId}
                onClick={() => onConversationClick(conversation.id)}
                isCollapsed={isCollapsed}
                onRename={onRename}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </SidebarContent>
  );
}

export function AppSidebar({
  onNewChat,
  onSettingsClick,
  onConversationClick,
  className,
}: AppSidebarProps) {
  const { isMobile, setOpenMobile, state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const navigate = useNavigate();
  const { id: currentConversationId } = useParams<{ id: string }>();
  const { conversations, isLoading } = useConversations();
  const { renameConversation } = useConversationActions();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleNewChat = useCallback(() => {
    onNewChat?.();
    if (isMobile) {
      setOpenMobile(false);
    }
  }, [isMobile, onNewChat, setOpenMobile]);

  const handleSearchClick = useCallback(() => {
    setIsSearchOpen(true);
  }, []);

  const handleConversationClick = useCallback(
    (id: string) => {
      if (isMobile) {
        setOpenMobile(false);
      }

      if (onConversationClick) {
        onConversationClick(id);
        return;
      }

      navigate(`/chat/${id}`);
    },
    [isMobile, navigate, onConversationClick, setOpenMobile]
  );

  return (
    <>
      <Sidebar
        variant="inset"
        collapsible="icon"
        className={cn(
          "[&_[data-sidebar=sidebar]]:!bg-[var(--chat-sidebar-bg)] [&_[data-slot=sidebar-container]]:!bg-[var(--chat-sidebar-bg)] [&_[data-slot=sidebar-inner]]:overflow-hidden [&_[data-slot=sidebar-inner]]:rounded-xl [&_[data-slot=sidebar-inner]]:border-[var(--chat-border-soft)] [&_[data-slot=sidebar-inner]]:!bg-[var(--chat-sidebar-bg)]",
          className
        )}
      >
        <div className="flex h-full w-full flex-col">
          <SidebarHeaderContent isCollapsed={isCollapsed} />

          <ConversationSection
            conversations={conversations}
            isCollapsed={isCollapsed}
            isLoading={isLoading}
            currentConversationId={currentConversationId}
            onNewChat={handleNewChat}
            onSearch={handleSearchClick}
            onConversationClick={handleConversationClick}
            onRename={renameConversation}
          />

          <SidebarFooter className="px-2">
            <SettingsButton onClick={onSettingsClick || (() => {})} isCollapsed={isCollapsed} />
          </SidebarFooter>
        </div>
      </Sidebar>

      <SearchCommand open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </>
  );
}
