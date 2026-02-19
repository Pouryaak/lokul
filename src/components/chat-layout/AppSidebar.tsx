"use client";

import { useCallback } from "react";
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
import type { Conversation } from "@/types/index";
import {
  ConversationItem,
  EmptyState,
  LoadingState,
  NewChatItem,
  SettingsButton,
  SidebarLogo,
} from "./app-sidebar-parts";

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
        {!isCollapsed && <span className="font-semibold text-gray-900">Lokul</span>}
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
  onConversationClick: (id: string) => void;
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
  onConversationClick,
}: ConversationSectionProps) {
  return (
    <SidebarContent className="gap-4 px-2 py-4">
      <NewChatItem onClick={onNewChat} isCollapsed={isCollapsed} />
      {!isCollapsed && <p className="px-3 text-xs font-medium text-gray-500">Conversations</p>}

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

  const handleNewChat = useCallback(() => {
    onNewChat?.();
    if (isMobile) {
      setOpenMobile(false);
    }
  }, [isMobile, onNewChat, setOpenMobile]);

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
    <Sidebar variant="inset" collapsible="icon" className={className}>
      <SidebarHeaderContent isCollapsed={isCollapsed} />

      <ConversationSection
        conversations={conversations}
        isCollapsed={isCollapsed}
        isLoading={isLoading}
        currentConversationId={currentConversationId}
        onNewChat={handleNewChat}
        onConversationClick={handleConversationClick}
      />

      <SidebarFooter className="px-2">
        <SettingsButton onClick={onSettingsClick || (() => {})} isCollapsed={isCollapsed} />
      </SidebarFooter>
    </Sidebar>
  );
}
