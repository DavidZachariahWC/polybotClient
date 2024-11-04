'use client'

import { useState, useEffect } from "react"
import { useChat } from 'ai/react'
import { useUser } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowUp, Clock, Plus, X } from "lucide-react"
import Link from "next/link"

interface Conversation {
  id: string;
  title: string;
  createdAt: string;
}

export default function Component() {
  const { user } = useUser();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  const { 
    messages, 
    handleSubmit: handleChatSubmit, 
    input, 
    handleInputChange, 
    isLoading,
    setMessages 
  } = useChat({
    api: '/api/chat',
    body: {
      conversationId: currentConversationId
    },
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Hello! How can I help you today?'
      }
    ]
  })

  const [hasInteracted, setHasInteracted] = useState(false)

  useEffect(() => {
    // Load conversations when component mounts
    const loadConversations = async () => {
      try {
        const response = await fetch('/api/conversations');
        const data = await response.json();
        setConversations(data);
      } catch (error) {
        console.error('Error loading conversations:', error);
      }
    };

    if (user) {
      loadConversations();
    }
  }, [user]);

  const handleNewConversation = () => {
    setCurrentConversationId(null);
    setHasInteracted(false);
  }

  const handleSelectConversation = async (conversationId: string) => {
    setCurrentConversationId(conversationId);
    try {
      const response = await fetch(`/api/conversations/${conversationId}`);
      const data = await response.json();
      
      // Convert database messages to chat format
      const chatMessages = data.messages.map((msg: any) => ({
        id: msg.id,
        role: msg.sender === 'BOT' ? 'assistant' : 'user',
        content: msg.content
      }));

      // Reset chat with conversation history
      setMessages(chatMessages); // You'll need to get setMessages from useChat
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleChatSubmit(e)
    setHasInteracted(true)
  }

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Sidebar */}
      <div className="w-72 border-r border-gray-800 flex flex-col">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full" />
            <span className="font-semibold">Polybot</span>
          </div>
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-4 space-y-2">
          <Button variant="outline" className="w-full justify-start gap-2" onClick={handleNewConversation}>
            <Plus className="h-4 w-4" />
            New conversation
          </Button>
        </div>

        <div className="px-4 py-2">
          <h2 className="text-gray-400 text-sm">History</h2>
        </div>

        <ScrollArea className="flex-1">
          <div className="space-y-1 p-2">
            {conversations.map((conversation) => (
              <Button
                key={conversation.id}
                variant="ghost"
                className="w-full justify-start gap-2 text-gray-400 hover:text-white"
                onClick={() => handleSelectConversation(conversation.id)}
              >
                <Clock className="h-4 w-4" />
                {conversation.title}
              </Button>
            ))}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback>DZ</AvatarFallback>
            </Avatar>
            <div className="text-sm">David Zachariah</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-8 overflow-auto">
          {!hasInteracted ? (
            <>
              <h1 className="text-2xl font-semibold text-center mb-8">Ask Polybot anything</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
                {[
                  "Make my email sound more professional",
                  "Thrift fashion reels",
                  "Imagine an image"
                ].map((suggestion, index) => (
                  <div
                    key={index}
                    className="bg-gray-900 border border-gray-800 rounded-lg p-4 cursor-pointer hover:bg-gray-800 transition-colors"
                    onClick={() => {
                      handleInputChange({ target: { value: suggestion } } as any)
                      setHasInteracted(true)
                    }}
                  >
                    <p className="text-sm">{suggestion}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-4">
              {messages.map(m => (
                <div
                  key={m.id}
                  className={`flex flex-col ${
                    m.role === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`rounded-lg px-3 py-2 max-w-[85%] ${
                      m.role === 'user'
                        ? 'bg-blue-600'
                        : 'bg-gray-800'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start">
                  <div className="rounded-lg px-3 py-2 bg-gray-800">
                    Thinking...
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-800">
          <form onSubmit={handleFormSubmit} className="max-w-3xl mx-auto relative">
            <Input
              placeholder="Ask Polybot anything..."
              className="bg-gray-900 border-gray-700 pr-12"
              value={input}
              onChange={handleInputChange}
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              variant="ghost"
              disabled={isLoading}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </form>
          <p className="text-center text-gray-400 text-sm mt-2">
            Messages are generated by AI and may be inaccurate or inappropriate.{" "}
            <Link href="#" className="text-blue-400 hover:underline">
              Learn more
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}