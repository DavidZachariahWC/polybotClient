export interface DbUser {
  id: string;
  created_at: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  profile_image_url?: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  thread_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  content: string;
  sender: 'USER' | 'BOT';
  created_at: string;
} 