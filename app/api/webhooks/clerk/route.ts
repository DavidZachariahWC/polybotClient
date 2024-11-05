import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Webhook secret found in Clerk Dashboard
const webhookSecret = process.env.CLERK_WEBHOOK_SECRET

async function handler(request: Request) {
  const payload = await request.json()
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    })
  }

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(webhookSecret || '')

  let evt: WebhookEvent

  // Verify the webhook payload
  try {
    evt = wh.verify(JSON.stringify(payload), {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400
    })
  }

  // Handle the webhook
  const eventType = evt.type;
  
  if (eventType === 'user.created') {
    const { id } = evt.data;
    
    // Call our create-user endpoint
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/create-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: id }),
      });

      if (!response.ok) {
        throw new Error('Failed to create user in Supabase');
      }

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error creating user:', error);
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ success: true });
}

export const POST = handler; 