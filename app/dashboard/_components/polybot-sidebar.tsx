'use client'

import * as React from "react"
import { useState } from "react"
import { Plus, Bot, X, Edit2, Check } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { useConversation } from '@/contexts/ConversationContext'
import ModeToggle from '@/components/mode-toggle'
import { UserProfile } from '@/components/user-profile'
import config from '@/config'

export default function PolybotSidebar() {
  const {
    conversations,
    currentConversation,
    setCurrentConversation,
    createNewConversation,
    loadMessages,
    renameConversation,
    deleteConversation
  } = useConversation();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const handleNewChat = async () => {
    try {
      await createNewConversation();
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteConversation(id);
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  const handleRename = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const conversation = conversations.find(conv => conv.id === id);
    if (conversation) {
      setEditingId(id);
      setEditingTitle(conversation.title);
    }
  };

  const handleRenameSubmit = async (id: string, e: React.FormEvent) => {
    e.preventDefault();
    try {
      await renameConversation(id, editingTitle);
      setEditingId(null);
    } catch (error) {
      console.error('Error renaming conversation:', error);
    }
  };

  return (
    <div className="w-64 border-r flex flex-col h-full">
      <div className="p-2">
        <Button 
          className="w-full justify-start gap-2 rounded-lg"
          variant="outline"
          onClick={handleNewChat}
        >
          <Plus size={16} />
          New Chat
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {conversations.map((conv) => (
            <div key={conv.id} className="relative group">
              {editingId === conv.id ? (
                <form onSubmit={(e) => handleRenameSubmit(conv.id, e)} className="flex items-center">
                  <Input
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    className="flex-grow mr-2"
                    autoFocus
                  />
                  <Button type="submit" size="icon" variant="ghost">
                    <Check size={16} />
                  </Button>
                </form>
              ) : (
                <Button 
                  className={`w-full justify-start gap-2 rounded-lg pr-12 ${
                    currentConversation?.id === conv.id ? 'bg-purple-500/20' : ''
                  }`}
                  variant="ghost"
                  onClick={() => {
                    setCurrentConversation(conv);
                    loadMessages(conv.id);
                  }}
                >
                  <Bot size={16} />
                  <span className="truncate">{conv.title}</span>
                </Button>
              )}
              {editingId !== conv.id && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={(e) => handleRename(conv.id, e)}
                  >
                    <Edit2 size={12} />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 text-red-500 hover:text-red-700"
                    onClick={(e) => handleDelete(conv.id, e)}
                  >
                    <X size={12} />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="p-2 border-t flex justify-between items-center">
        <ModeToggle />
        {config?.auth?.enabled && <UserProfile />}
      </div>
    </div>
  );
}