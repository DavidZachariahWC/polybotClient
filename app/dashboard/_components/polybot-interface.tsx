// app/dashboard/_components/polybot-interface.tsx

'use client'

import { useState } from "react"
import { useConversation } from '@/contexts/ConversationContext';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowUp, Clock, Plus, X } from "lucide-react"
import Link from "next/link"
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css'; // Using dark theme to match the UI

export default function PolybotInterface() {
  const {
    conversations,
    currentConversation,
    messages,
    setCurrentConversation,
    createNewConversation,
    loadMessages
  } = useConversation();

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleNewChat = async () => {
    try {
      await createNewConversation();
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    setIsLoading(true);
    try {
      let conversationId = currentConversation?.id;
      
      // If no current conversation, create one
      if (!conversationId) {
        const newConversation = await createNewConversation(inputMessage);
        conversationId = newConversation.id;
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: inputMessage }],
          conversationId
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');
      
      // Reload messages after sending
      await loadMessages(conversationId);
      setInputMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 border-r bg-background p-4">
        <Button
          onClick={handleNewChat}
          className="w-full mb-4"
        >
          New Chat
        </Button>
        <ScrollArea className="h-[calc(100vh-8rem)]">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`p-2 cursor-pointer rounded hover:bg-accent ${
                currentConversation?.id === conv.id ? 'bg-accent' : ''
              }`}
              onClick={() => {
                setCurrentConversation(conv);
                loadMessages(conv.id);
              }}
            >
              {conv.title}
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <ScrollArea className="flex-1 p-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-4 ${
                message.sender === 'USER' ? 'text-right' : 'text-left'
              }`}
            >
              <div
                className={`inline-block p-2 rounded-lg max-w-[80%] ${
                  message.sender === 'USER'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                {message.sender === 'USER' ? (
                  <div className="text-sm">{message.content}</div>
                ) : (
                  <div className="markdown-content">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight]}
                      components={{
                        code({ node, inline, className, children, ...props }) {
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
                  </div>
                )}
              </div>
            </div>
          ))}
        </ScrollArea>

        <form onSubmit={handleSendMessage} className="p-4 border-t">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 p-2 border rounded"
              placeholder="Type your message..."
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}