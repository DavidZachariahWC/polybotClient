import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase/index'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { messages, conversationId } = await req.json()
    const lastMessage = messages[messages.length - 1]

    // Make the API call to the backend server first
    try {
      const response = await fetch('http://localhost:8000/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: {
            text: lastMessage.content
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Backend server error: ${response.statusText}`)
      }

      const data = await response.json()

      // Only try database operations after we have a successful response
      try {
        // If no conversation exists, create one
        let currentConversationId = conversationId
        if (!currentConversationId) {
          const { data: newConversation } = await supabase
            .from('conversations')
            .insert([
              {
                user_id: userId,
                title: lastMessage.content.slice(0, 50) + '...'
              }
            ])
            .select('id')
            .single()

          if (newConversation) {
            currentConversationId = newConversation.id
          }
        }

        // Store messages in database (don't await these)
        if (currentConversationId) {
          Promise.resolve(
            supabase
              .from('messages')
              .insert([
                {
                  conversation_id: currentConversationId,
                  content: lastMessage.content,
                  sender: 'USER'
                },
                {
                  conversation_id: currentConversationId,
                  content: data.text,
                  sender: 'BOT'
                }
              ])
          )
            .then(() => console.log('Messages stored'))
            .catch((err: Error) => console.error('Failed to store messages:', err))
        }
      } catch (dbError) {
        // Log database errors but don't fail the request
        console.error('Database error:', dbError)
      }

      // Return the bot response regardless of database success
      return new Response(JSON.stringify({ 
        role: 'assistant',
        content: data.text,
        id: crypto.randomUUID()
      }), {
        headers: { 'Content-Type': 'application/json' }
      })

    } catch (backendError) {
      console.error('Backend server error:', backendError)
      // Return a fallback response if backend is not available
      return new Response(JSON.stringify({ 
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting to my backend server. Please try again later.",
        id: crypto.randomUUID()
      }), {
        headers: { 'Content-Type': 'application/json' }
      })
    }

  } catch (error) {
    console.error('Error in chat API route:', error)
    return new Response('Error processing chat request', { status: 500 })
  }
}
