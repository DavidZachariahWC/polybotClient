// app/dashboard/_components/polybot-interface.tsx

'use client'

import * as React from "react"
import { useState } from "react"
import { useConversation } from '@/contexts/ConversationContext'
import { Bot, ClipboardCopy, Moon, Plus, Send, Sun, Trash2 } from "lucide-react"
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
    conversations,
    currentConversation,
    messages,
    setCurrentConversation,
    createNewConversation,
    loadMessages
  } = useConversation();

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = React.useState(true);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Add dark mode effect
  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  // Add scroll effect
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

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
    <div className={`flex flex-col h-screen bg-zinc-900 ${darkMode ? 'dark' : ''}`}>
      {/* Header */}
      <header className="flex h-14 items-center px-4 bg-zinc-900 border-b border-zinc-700">
        <h1 className="text-lg font-semibold text-white">PolyBot</h1>
        <Button 
          variant="ghost" 
          size="icon" 
          className="ml-auto text-white hover:bg-white/10"
          onClick={() => setDarkMode(!darkMode)}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </Button>
      </header>

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
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

        {/* Chat area */}
        <div className="flex-1 flex flex-col bg-zinc-900">
          {/* Chat title */}
          <div className="flex h-14 items-center px-4 border-b border-zinc-700">
            <h2 className="text-lg font-semibold text-white">{currentConversation?.title || 'New Chat'}</h2>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 px-4" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center text-zinc-400">
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
                      <div className="text-sm font-medium text-white">
                        {message.sender === 'BOT' ? 'PolyBot' : 'You'}
                      </div>
                      <div className="text-base text-zinc-300">
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
                          className="h-6 w-6 text-zinc-400 hover:text-white"
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
          <form onSubmit={handleSendMessage} className="p-4 border-t border-zinc-700">
            <div className="relative">
              <Textarea
                className="resize-none rounded-xl py-3 px-4 bg-zinc-800 border-none text-white h-[40px] min-h-[40px] focus:ring-2 focus:ring-purple-500/50"
                rows={1}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 bg-transparent hover:bg-white/10 text-zinc-400"
                disabled={!inputMessage.trim() || isLoading}
              >
                <Send size={14} />
                <span className="sr-only">Send message</span>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}