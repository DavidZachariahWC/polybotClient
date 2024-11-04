import { supabase } from "@/lib/supabase";

interface Message {
  id: string;
  content: string;
  sender: 'USER' | 'BOT';
  created_at: string;
  conversation_id: string;
}

interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  messages?: Message[];
}

export const conversationService = {
  async createConversation(userId: string, title?: string): Promise<Conversation> {
    const { data, error } = await supabase
      .from('conversations')
      .insert([
        {
          user_id: userId,
          title: title || "New Conversation",
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async addMessage(
    conversationId: string,
    content: string,
    sender: "USER" | "BOT"
  ): Promise<Message> {
    const { data, error } = await supabase
      .from('messages')
      .insert([
        {
          conversation_id: conversationId,
          content,
          sender,
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getConversations(userId: string): Promise<Conversation[]> {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        messages (
          content,
          created_at
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getConversationMessages(
    conversationId: string,
    userId: string
  ): Promise<Message[] | null> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },
}; 