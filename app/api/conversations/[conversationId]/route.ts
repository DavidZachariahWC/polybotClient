import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase/index';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { conversationId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', params.conversationId)
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

export async function POST() {
  return new Response('Not implemented', { status: 501 });
}

