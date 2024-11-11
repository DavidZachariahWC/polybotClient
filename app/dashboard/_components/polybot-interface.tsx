'use client'

import * as React from "react"
import { useState } from "react"
import { useConversation } from '@/contexts/ConversationContext'
import { Bot, ClipboardCopy, Send } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
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

export default function PolybotInterface() {
  const {
    currentConversation,
    messages,
    createNewConversation,
    loadMessages
  } = useConversation();

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Add scroll effect
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    setIsLoading(true);
    try {
      let conversationId = currentConversation?.id;
      
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
      
      await loadMessages(conversationId);
      setInputMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
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
      <ScrollArea className="flex-1 px-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Start a conversation...
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {messages.map((message) => (
              <div key={message.id} className="flex gap-3 group">
                <Avatar className="h-8 w-8">
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
                      message.content
                    )}
                  </div>
                </div>
                <div className="flex items-center">
                  {message.sender === 'BOT' && (
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
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="relative">
          <Textarea
            className="resize-none rounded-xl py-3 px-4 pr-10 min-h-[40px]"
            rows={1}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6"
            disabled={!inputMessage.trim() || isLoading}
          >
            <Send size={14} />
            <span className="sr-only">Send message</span>
          </Button>
        </div>
      </form>
    </div>
  );
}