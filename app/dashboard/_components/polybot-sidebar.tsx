'use client'

import * as React from "react"
import { Plus, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useConversation } from '@/contexts/ConversationContext'

export default function PolybotSidebar() {
  const {
    conversations,
    currentConversation,
    setCurrentConversation,
    createNewConversation,
    loadMessages
  } = useConversation();

  const handleNewChat = async () => {
    try {
      await createNewConversation();
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  };

  return (
    <div className="w-64 bg-zinc-900/50 border-r border-zinc-700 flex flex-col">
      <div className="p-2">
        <Button 
          className="w-full justify-start gap-2 rounded-lg bg-transparent text-white hover:bg-purple-500/20 focus:bg-purple-500/20 focus:ring-2 focus:ring-purple-500/50" 
          variant="ghost"
          onClick={handleNewChat}
        >
          <Plus size={16} />
          New Chat
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {conversations.map((conv) => (
            <Button 
              key={conv.id}
              className={`w-full justify-start gap-2 rounded-lg text-white hover:bg-purple-500/20 focus:ring-2 focus:ring-purple-500/50 ${
                currentConversation?.id === conv.id ? 'bg-purple-500/20' : 'bg-transparent'
              }`}
              variant="ghost"
              onClick={() => {
                setCurrentConversation(conv);
                loadMessages(conv.id);
              }}
            >
              <Bot size={16} />
              {conv.title}
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
} 