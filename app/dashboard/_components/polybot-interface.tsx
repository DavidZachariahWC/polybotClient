'use client'

import * as React from "react"
import { useState, useRef, useEffect } from "react"
import { useConversation } from '@/contexts/ConversationContext'
import { Bot, ClipboardCopy, Send, Paperclip, Loader2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css'

interface CodeProps extends React.ClassAttributes<HTMLElement>, 
  React.HTMLAttributes<HTMLElement> {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

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

  const [messages, setMessages] = useState<Message[]>(contextMessages);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    setMessages(contextMessages);
  }, [contextMessages]);

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

      // Immediately add the user's message and a placeholder for the AI's response
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

      await loadMessages(conversationId);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAttachment = () => {
    // Implement attachment functionality here
    console.log('Attachment button clicked');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Conversation Title */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">
          {currentConversation?.title || 'New Conversation'}
        </h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Start a conversation...
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {messages.map((message) => (
                <div key={message.id} className="flex gap-3 group">
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
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeHighlight]}
                            components={{
                              code({ inline, className, children, ...props }: CodeProps) {
                                return (
                                  <code
                                    className={`${className} ${
                                      inline ? 'inline-code' : 'block-code'
                                    }`}
                                    {...props}
                                  >
                                    {children}
                                  </code>
                                );
                              },
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        ) : (
                          <div className="flex items-center">
                            <span className="typing-indicator">
                              <span></span>
                              <span></span>
                              <span></span>
                            </span>
                          </div>
                        )
                      ) : (
                        message.content
                      )}
                    </div>
                  </div>
                  <div className="flex items-center">
                    {message.sender === 'BOT' && message.content && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-muted-foreground hover:text-foreground"
                        onClick={() => navigator.clipboard.writeText(message.content)}
                      >
                        <ClipboardCopy size={12} />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="border-t">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <form onSubmit={handleSendMessage} className="relative">
            <Textarea
              className="resize-none rounded-xl py-3 px-4 pr-20 min-h-[40px]"
              rows={1}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isLoading}
              placeholder="Type your message..."
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={handleAttachment}
                disabled={isLoading}
              >
                <Paperclip size={16} />
                <span className="sr-only">Attach file</span>
              </Button>
              <Button
                type="submit"
                size="icon"
                className="h-8 w-8"
                disabled={!inputMessage.trim() || isLoading}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send size={16} />}
                <span className="sr-only">Send message</span>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}