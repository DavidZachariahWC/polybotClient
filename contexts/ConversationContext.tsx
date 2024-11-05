'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Conversation, Message } from '@/types/database';

interface ConversationContextType {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  setCurrentConversation: (conversation: Conversation | null) => void;
  createNewConversation: (title?: string) => Promise<Conversation>;
  loadMessages: (conversationId: string) => Promise<void>;
}

const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

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

  const createNewConversation = async (title?: string) => {
    const response = await fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
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

  return (
    <ConversationContext.Provider
      value={{
        conversations,
        currentConversation,
        messages,
        setCurrentConversation,
        createNewConversation,
        loadMessages,
      }}
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