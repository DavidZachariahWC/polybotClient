import React from 'react';
import { useSignUp } from "@clerk/nextjs";
import { useEffect } from "react";
import { createSupabaseUser } from "@/lib/auth-helpers";
import { toast } from "sonner";

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { signUp, isLoaded } = useSignUp();

  useEffect(() => {
    if (!isLoaded) return;

    // Intercept the successful signup
    const originalSignUp = signUp.create;
    signUp.create = async (...args) => {
      const result = await originalSignUp.apply(signUp, args);
      console.log('Signup result:', result);
      
      // After successful signup, create Supabase user
      if (result.status === 'complete' && result.createdUserId) {
        try {
          console.log('Creating Supabase user for:', result.createdUserId);
          await createSupabaseUser(result.createdUserId);
          toast.success('Account created successfully!');
        } catch (error) {
          console.error('Failed to create Supabase user:', error);
          toast.error('There was an issue setting up your account. Please contact support.');
        }
      }
      
      return result;
    };

    // Cleanup
    return () => {
      signUp.create = originalSignUp;
    };
  }, [isLoaded, signUp]);

  return children;
} 