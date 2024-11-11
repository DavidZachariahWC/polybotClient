// Temporarily commented out due to Node.js glitch
/*
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase/index';
import { NextRequest, NextResponse } from 'next/server';

// Define the params interface
interface RouteParams {
  params: {
    conversationId: string;
  };
}

export async function PATCH(
  req: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { conversationId } = params;
    const { title } = await req.json();

    if (!title) {
      return NextResponse.json({ error: 'Missing title' }, { status: 400 });
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
*/

// Temporary placeholder to make the file a module
export const dynamic = 'force-dynamic';
export async function PATCH() {
  return new Response('Placeholder');
} 