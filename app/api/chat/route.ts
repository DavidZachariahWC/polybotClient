import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase/index'

export async function POST(req: Request) {
  try {
    const { userId, getToken } = await auth()
    if (!userId) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Get the session token
    const token = await getToken()

    const { messages, conversationId } = await req.json()
    const lastMessage = messages[messages.length - 1]
    let activeConversationId = conversationId

    // Make the API call to the backend server first
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL
      if (!backendUrl) {
        throw new Error('Backend URL not configured')
      }

      const response = await fetch(`${backendUrl}/api/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: {
            text: lastMessage.content
          },
          conversation_id: activeConversationId || undefined
        })
      })

      if (!response.ok) {
        throw new Error(`Backend server error: ${response.statusText}`)
      }

      const data = await response.json()

      // Rest of the code remains the same...
      try {
        if (!activeConversationId) {
          const { data: newConversation, error: convError } = await supabase
            .from('conversations')
            .insert([
              {
                user_id: userId,
                title: lastMessage.content.slice(0, 50) + '...',
                updated_at: new Date().toISOString()
              }
            ])
            .select('id')
            .single()

          if (convError) throw convError
          if (newConversation) {
            activeConversationId = newConversation.id
          }
        } else {
          await supabase
            .from('conversations')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', activeConversationId)
        }

        if (activeConversationId) {
          const { error: msgError } = await supabase
            .from('messages')
            .insert([
              {
                conversation_id: activeConversationId,
                content: lastMessage.content,
                sender: 'USER',
                created_at: new Date().toISOString()
              },
              {
                conversation_id: activeConversationId,
                content: data.text,
                sender: 'BOT',
                created_at: new Date().toISOString()
              }
            ])

          if (msgError) throw msgError
        }
      } catch (dbError) {
        console.error('Database error:', dbError)
      }

      return new Response(JSON.stringify({ 
        role: 'assistant',
        content: data.text,
        id: crypto.randomUUID(),
        conversationId: activeConversationId
      }), {
        headers: { 'Content-Type': 'application/json' }
      })

    } catch (backendError) {
      console.error('Backend server error:', backendError)
      return new Response(JSON.stringify({ 
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting to my backend server. Please try again later.",
        id: crypto.randomUUID(),
        conversationId: activeConversationId
      }), {
        headers: { 'Content-Type': 'application/json' }
      })
    }

  } catch (error) {
    console.error('Error in chat API route:', error)
    return new Response('Error processing chat request', { status: 500 })
  }
}
