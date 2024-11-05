import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase/index';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { data: conversations, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
    }

    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Error in GET conversations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { title } = await request.json();

    const { data: conversation, error } = await supabase
      .from('conversations')
      .insert([
        {
          user_id: userId,
          title: title || 'New Conversation',
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
    }

    return NextResponse.json(conversation);
  } catch (error) {
    console.error('Error in POST conversation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
