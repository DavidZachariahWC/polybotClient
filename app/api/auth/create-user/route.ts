import { supabase } from '@/lib/supabase/index'
import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

export async function POST(request: Request) {
  const { userId } = await request.json();

  try {
    // Get user details from Clerk - fix the async call
    const clerk = await clerkClient();
    const clerkUser = await clerk.users.getUser(userId);

    // Check if user exists in Supabase
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error checking existing user:', fetchError);
      return NextResponse.json(
        { error: 'Failed to check existing user' },
        { status: 500 }
      );
    }

    if (existingUser) {
      return NextResponse.json({ success: true });
    }

    // Create new user with Clerk details
    const { error: insertError } = await supabase
      .from('users')
      .insert([{ 
        id: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress,
        first_name: clerkUser.firstName,
        last_name: clerkUser.lastName,
        profile_image_url: clerkUser.imageUrl,
        created_at: new Date().toISOString()
      }]);
    
    if (insertError) {
      console.error('Error creating user:', insertError);
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in createSupabaseUser:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 