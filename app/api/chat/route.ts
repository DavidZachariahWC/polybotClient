// app/api/chat/route.ts

import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase/index'

export async function POST(req: Request) {
  try {
    const { userId, getToken } = await auth()
    if (!userId) {
      return new Response('Unauthorized', { status: 401 })
    }

    const token = await getToken()
    const { messages, conversationId } = await req.json()
    const lastMessage = messages[messages.length - 1]
    let activeConversationId = conversationId
    let threadId: string | undefined

    // If we have a conversationId, get the thread_id
    if (activeConversationId) {
      const { data: conversation } = await supabase
        .from('conversations')
        .select('thread_id')
        .eq('id', activeConversationId)
        .single()
      
      threadId = conversation?.thread_id
    }

    // Make the API call to the backend server
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL
      if (!backendUrl) {
        throw new Error('Backend URL not configured')
      }

      console.log('Making request to backend:', `${backendUrl}/api/ask`)
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
          conversation_id: activeConversationId || undefined,
          thread_id: threadId || undefined
        })
      })

      console.log('Backend response status:', response.status)
      console.log('Backend response headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        throw new Error(`Backend server error: ${response.statusText}`)
      }

      const rawResponse = await response.clone().text()
      console.log('Raw response body:', rawResponse)

      let data
      try {
        data = await response.json()
        console.log('Parsed response data:', data)
      } catch (jsonError) {
        console.error('Failed to parse response as JSON:', rawResponse)
        console.error('JSON parse error:', jsonError)
        throw jsonError
      }

      try {
        console.log('Starting database operations...')
        if (!activeConversationId) {
          console.log('Creating new conversation...')
          const { data: newConversation, error: convError } = await supabase
            .from('conversations')
            .insert([
              {
                user_id: userId,
                title: lastMessage.content.slice(0, 50) + '...',
                thread_id: data.thread_id,
                updated_at: new Date().toISOString()
              }
            ])
            .select('id')
            .single()

          if (convError) throw convError
          if (newConversation) {
            activeConversationId = newConversation.id
          }
        } else if (data.thread_id && !threadId) {
          // Update thread_id if it's new
          await supabase
            .from('conversations')
            .update({ 
              thread_id: data.thread_id,
              updated_at: new Date().toISOString() 
            })
            .eq('id', activeConversationId)
        }

        if (activeConversationId) {
          console.log('Inserting messages into database...')
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
        console.log('Database operations completed successfully')
      } catch (dbError) {
        console.error('Database operation failed:', dbError)
        throw dbError
      }

      console.log('Sending successful response to client')
      return new Response(JSON.stringify({ 
        role: 'assistant',
        content: data.text,
        id: crypto.randomUUID(),
        conversationId: activeConversationId,
        threadId: data.thread_id
      }), {
        headers: { 'Content-Type': 'application/json' }
      })

    } catch (backendError) {
      console.error('Backend processing failed:', backendError)
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
//
  