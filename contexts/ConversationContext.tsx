'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Conversation, Message } from '@/types/database';

interface ConversationContextType {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  setCurrentConversation: (conversation: Conversation | null) => void;
  createNewConversation: (initialMessage?: string) => Promise<Conversation>;
  loadMessages: (conversationId: string) => Promise<void>;
  renameConversation: (conversationId: string, newTitle: string) => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
}

export const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

export function ConversationProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    // Load conversations on mount
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/conversations');
      if (!response.ok) throw new Error('Failed to fetch conversations');
      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const createNewConversation = async (initialMessage?: string) => {
    const response = await fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ initialMessage }),
    });
    
    if (!response.ok) throw new Error('Failed to create conversation');
    const conversation = await response.json();
    setConversations(prev => [conversation, ...prev]);
    setCurrentConversation(conversation);
    setMessages([]);
    return conversation;
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const renameConversation = async (conversationId: string, newTitle: string) => {
    try {
      const response = await fetch(`/api/conversations/rename`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId,
          title: newTitle
        })
      });

      if (!response.ok) {
        throw new Error('Failed to rename conversation');
      }

      const updatedConversation = await response.json();

      // Update the conversations list with the new title
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, title: newTitle }
            : conv
        )
      );

      // Update current conversation if it's the one being renamed
      if (currentConversation?.id === conversationId) {
        setCurrentConversation({ ...currentConversation, title: newTitle });
      }
    } catch (error) {
      console.error('Error renaming conversation:', error);
      throw error;
    }
  };

  const deleteConversation = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}/delete`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete conversation');
      }

      // Remove the conversation from state
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));

      // If the deleted conversation was the current one, clear it
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  };

  const value = {
    conversations,
    currentConversation,
    messages,
    setCurrentConversation,
    createNewConversation,
    loadMessages,
    renameConversation,
    deleteConversation,
  };

  return (
    <ConversationContext.Provider
      value={value}
    >
      {children}
    </ConversationContext.Provider>
  );
}

export const useConversation = () => {
  const context = useContext(ConversationContext);
  if (context === undefined) {
    throw new Error('useConversation must be used within a ConversationProvider');
  }
  return context;
}; 