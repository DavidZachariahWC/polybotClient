import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase/index';
import { NextRequest, NextResponse } from 'next/server';

type RouteContext = {
  params: {
    conversationId: string;
  };
};

export async function GET(
  req: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // First verify the conversation belongs to the user
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('id')
      .eq('id', context.params.conversationId)
      .eq('user_id', userId)
      .single();

    if (convError || !conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', context.params.conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error in GET messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  return NextResponse.json({ error: 'Not implemented' }, { status: 501 });
}

