import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase/index';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { conversationId, title } = await request.json();

    if (!conversationId || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // First verify the conversation belongs to the user
    const { data: conversation, error: verifyError } = await supabase
      .from('conversations')
      .select('id')
      .eq('id', conversationId)
      .eq('user_id', userId)
      .single();

    if (verifyError || !conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Update the conversation title
    const { data, error } = await supabase
      .from('conversations')
      .update({ 
        title,
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId)
      .select()
      .single();

    if (error) {
      console.error('Error renaming conversation:', error);
      return NextResponse.json({ error: 'Failed to rename conversation' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in PATCH conversation rename:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 