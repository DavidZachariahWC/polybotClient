import { auth } from "@clerk/nextjs/server";
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { conversationService } from "@/utils/data/conversation/conversationService";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from Supabase
    const { data: user, error: userError } = await supabase
      .from('users')
      .select()
      .eq('user_id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { messages, conversationId } = await req.json();
    const userMessage = messages[messages.length - 1];

    // Get or create conversation
    let conversation;
    if (conversationId) {
      const { data, error } = await supabase
        .from('conversations')
        .select()
        .eq('id', conversationId)
        .single();
      
      if (error) throw error;
      conversation = data;
    } else {
      conversation = await conversationService.createConversation(
        userId,
        userMessage.content.slice(0, 100)
      );
    }

    // Store user message
    await conversationService.addMessage(
      conversation.id,
      userMessage.content,
      'USER'
    );

    // Use the existing AI logic
    const response = await fetch("http://localhost:8000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: messages,
      }),
    });

    const aiResponse = await response.text();

    // Store AI response
    await conversationService.addMessage(
      conversation.id,
      aiResponse,
      'BOT'
    );

    return NextResponse.json({ 
      role: 'assistant',
      content: aiResponse,
      conversationId: conversation.id
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 