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

export async function DELETE(
  req: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { conversationId } = params;

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

    // Delete all messages first (due to foreign key constraint)
    const { error: messagesError } = await supabase
      .from('messages')
      .delete()
      .eq('conversation_id', conversationId);

    if (messagesError) {
      console.error('Error deleting messages:', messagesError);
      return NextResponse.json({ error: 'Failed to delete messages' }, { status: 500 });
    }

    // Then delete the conversation
    const { error: conversationError } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);

    if (conversationError) {
      console.error('Error deleting conversation:', conversationError);
      return NextResponse.json({ error: 'Failed to delete conversation' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE conversation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
*/