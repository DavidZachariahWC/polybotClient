export async function createSupabaseUser(userId: string) {

// this is a helper function to create a user in supabase
// this is called by components/auth/auth-wrapper.tsx when a user signs up through clerk 

  try {
    const response = await fetch('/api/auth/create-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error('Failed to create user');
    }

    return true;
  } catch (error) {
    console.error('Error in createSupabaseUser:', error);
    throw error;
  }
} 