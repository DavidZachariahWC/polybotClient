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
import rehypeRaw from 'rehype-raw'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import emoji from 'remark-emoji'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'

interface CodeProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
  [key: string]: any;
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
  const [isConversationLoading, setIsConversationLoading] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    setIsConversationLoading(true);
    setMessages([]);
    if (contextMessages.length > 0) {
      setMessages(contextMessages);
    }
    setIsConversationLoading(false);
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
      const botResponse = data.message;

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
    console.log('Attachment button clicked');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4">
        <h2 className="text-lg font-semibold">
          {currentConversation?.title || 'New Conversation'}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8">
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
                          <div className="chat-message text-base">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm, emoji, remarkMath]}
                              rehypePlugins={[rehypeHighlight, rehypeKatex]}
                              className="prose prose-invert max-w-none"
                              components={{
                                code(props: CodeProps) {
                                  const { inline, className, children, ...rest } = props;
                                  const match = /language-(\w+)/.exec(className || '');
                                  return inline ? (
                                    <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-200 text-lg" {...rest}>
                                      {children}
                                    </code>
                                  ) : (
                                    <div className="relative">
                                      {match && (
                                        <div className="absolute right-2 top-2 text-xs text-zinc-400">
                                          {match[1]}
                                        </div>
                                      )}
                                      <pre className="!bg-zinc-800 !p-4 rounded-lg overflow-x-auto">
                                        <code className={className} {...rest}>
                                          {children}
                                        </code>
                                      </pre>
                                    </div>
                                  );
                                },
                                p: ({ children }) => <p className="mb-4 last:mb-0 text-lg">{children}</p>,
                                ul: ({ children }) => <ul className="list-disc pl-4 mb-4">{children}</ul>,
                                ol: ({ children }) => <ol className="list-decimal pl-4 mb-4">{children}</ol>,
                                li: ({ children }) => <li className="mb-1">{children}</li>,
                                blockquote: ({ children }) => (
                                  <blockquote className="border-l-4 border-zinc-700 pl-4 italic my-4">
                                    {children}
                                  </blockquote>
                                ),
                                a: ({ children, href }) => (
                                  <a 
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:underline"
                                  >
                                    {children}
                                  </a>
                                ),
                                table: ({ children }) => (
                                  <div className="overflow-x-auto my-4">
                                    <table className="min-w-full divide-y divide-zinc-700">
                                      {children}
                                    </table>
                                  </div>
                                ),
                                th: ({ children }) => (
                                  <th className="px-4 py-2 bg-zinc-800 text-left font-semibold">
                                    {children}
                                  </th>
                                ),
                                td: ({ children }) => (
                                  <td className="px-4 py-2 border-t border-zinc-700">
                                    {children}
                                  </td>
                                ),
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          </div>
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
                        <div className="whitespace-pre-wrap text-lg">{message.content}</div>
                      )}
                    </div>
                  </div>
                  <div ref={messagesEndRef} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <form onSubmit={handleSendMessage} className="relative">
          <Textarea
            className="resize-none rounded-xl py-3 px-4 pr-20 min-h-[100px]"
            rows={4}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder={isLoading ? "PolyBot is thinking..." : "Type your message..."}
          />
          <div className="absolute left-2 bottom-2 flex items-center gap-2">
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
          </div>
          <div className="absolute right-2 bottom-2 flex items-center">
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
  );
}