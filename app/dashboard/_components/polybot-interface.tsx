//officialPolyBot/app/dashboard/_components/polybot-interface.tsx
'use client'

import * as React from "react"
import { useState, useRef, useEffect } from "react"
import { useConversation } from '@/contexts/ConversationContext'
import { Bot, Send, Paperclip, Loader2, ClipboardCopy } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import MarkdownRenderer from '@/components/MarkdownRenderer/MarkdownRenderer'

interface Message {
  id: string;
  sender: 'USER' | 'BOT';
  content: string;
}

export default function PolybotInterface() {
  const {
    currentConversation,
    messages: contextMessages,
    createNewConversation,
    loadMessages
  } = useConversation();

  // Local messages state
  const [messages, setMessages] = useState<Message[]>(contextMessages);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isConversationLoading, setIsConversationLoading] = useState(false);

  // Handle initial scroll when messages are loaded
  useEffect(() => {
    if (!isConversationLoading && messages.length > 0) {
      // Small delay to allow for initial markdown rendering
      const timeoutId = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior: "auto", // Use auto instead of smooth for initial scroll
          block: "end",
        });
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [isConversationLoading, messages]);

  // Update ResizeObserver to handle dynamic content changes
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      if (!isConversationLoading) { // Only auto-scroll if not loading
        messagesEndRef.current?.scrollIntoView({ 
          behavior: "smooth",
          block: "end",
        });
      }
    });

    if (messagesContainerRef.current) {
      observer.observe(messagesContainerRef.current);
    }

    return () => {
      if (messagesContainerRef.current) {
        observer.unobserve(messagesContainerRef.current);
      }
    };
  }, [isConversationLoading]);

  // Sync local messages with contextMessages
  useEffect(() => {
    setMessages(contextMessages);
  }, [contextMessages]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (currentConversation) {
        setIsConversationLoading(true);
        try {
          await loadMessages(currentConversation.id);
        } catch (error) {
          console.error('Error loading messages:', error);
        } finally {
          setIsConversationLoading(false);
        }
      }
    };

    fetchMessages();
  }, [currentConversation]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    setIsLoading(true);
    const userMessage = inputMessage;
    setInputMessage('');

    try {
      let conversationId = currentConversation?.id;
      
      if (!conversationId) {
        const newConversation = await createNewConversation(userMessage);
        conversationId = newConversation.id;
      }

      // Immediately add user message and placeholder bot message
      const newUserMessage: Message = { id: Date.now().toString(), sender: 'USER', content: userMessage };
      const placeholderBotMessage: Message = { id: (Date.now() + 1).toString(), sender: 'BOT', content: '' };
      setMessages(prevMessages => [...prevMessages, newUserMessage, placeholderBotMessage]);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: userMessage }],
          conversationId
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');
      
      const data = await response.json();
      const botResponse = data.message; // Adjust this based on your API response structure

      // Update the placeholder with the actual bot response
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === placeholderBotMessage.id ? { ...msg, content: botResponse } : msg
        )
      );

      // Load messages from the conversation
      await loadMessages(conversationId);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAttachment = () => {
    console.log('Attachment button clicked');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Conversation Title */}
      <div className="p-4">
        <h2 className="text-lg font-semibold">
          {currentConversation?.title || 'New Conversation'}
        </h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {isConversationLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Start a conversation...
            </div>
          ) : (
            <div 
              className="space-y-4 py-4"
              ref={messagesContainerRef}
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className="flex gap-3 group"
                >
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    {message.sender === 'BOT' ? (
                      <div className="bg-purple-500 h-full w-full flex items-center justify-center">
                        <Bot size={16} className="text-white" />
                      </div>
                    ) : (
                      <AvatarImage src="/placeholder.svg" />
                    )}
                    <AvatarFallback>{message.sender === 'BOT' ? 'AI' : 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-1 flex-grow">
                    <div className="text-sm font-medium">
                      {message.sender === 'BOT' ? 'PolyBot' : 'You'}
                    </div>
                    <div className="text-base">
                      {message.sender === 'BOT' ? (
                        message.content ? (
                          <div className="text-sm whitespace-pre-wrap">
                            <MarkdownRenderer content={message.content} />
                          </div>
                        ) : (     
                          // Typing indicator when bot content is empty
                          <div className="flex items-center">
                            <div className="typing-indicator">
                              <span></span>
                              <span></span>
                              <span></span>
                            </div>
                          </div>
                        )
                      ) : (
                        <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4 w-full flex-shrink-0">
        <form onSubmit={handleSendMessage} className="relative">
          <Textarea
            className="resize-none rounded-xl py-3 px-4 pr-20 min-h-[100px] w-full"
            rows={4}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading || isConversationLoading}
            placeholder={isLoading || isConversationLoading ? "PolyBot is thinking..." : "Type your message..."}
          />
          <div className="absolute left-2 bottom-2 flex items-center gap-2">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={handleAttachment}
              disabled={isLoading || isConversationLoading}
            >
              <Paperclip size={16} />
              <span className="sr-only">Attach file</span>
            </Button>
          </div>
          <div className="absolute right-2 bottom-2 flex items-center">
            <Button
              type="submit"
              size="icon"
              className="h-8 w-8"
              disabled={!inputMessage.trim() || isLoading || isConversationLoading}
            >
              {isLoading || isConversationLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send size={16} />}
              <span className="sr-only">Send message</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
