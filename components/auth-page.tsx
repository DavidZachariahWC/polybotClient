'use client'

import { SignIn, SignUp } from "@clerk/nextjs"
import { Bot } from 'lucide-react'

interface AuthPageProps {
  mode: 'sign-in' | 'sign-up'
}

export function AuthPage({ mode }: AuthPageProps) {
  const ClerkComponent = mode === 'sign-in' ? SignIn : SignUp

  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Left side - Branding */}
      <div className="hidden lg:flex w-1/2 flex-col items-center justify-center bg-secondary p-8">
        <div className="flex items-center gap-2 mb-8">
          <Bot className="w-12 h-12 text-primary" />
          <span className="text-4xl font-bold text-primary">Polybot</span>
        </div>
        <h1 className="text-5xl font-serif text-center mb-4">
          Your conversations,
          <br />
          supercharged
        </h1>
        <p className="text-xl text-center text-muted-foreground max-w-md">
          AI-powered chat that adapts to your needs, harnessing multiple models for unparalleled accuracy.
        </p>
      </div>

      {/* Right side - Auth */}
      <div className="w-full lg:w-1/2 flex flex-col items-center">
        {/* Mobile logo */}
        <div className="lg:hidden flex justify-center mt-8">
          <div className="flex items-center gap-2">
            <Bot className="w-8 h-8 text-primary" />
            <span className="text-2xl font-semibold text-primary">Polybot</span>
          </div>
        </div>

        {/* Centered container for Clerk and footer */}
        <div className="flex-1 flex flex-col items-center justify-center w-full">
          <div className="flex min-w-screen justify-center my-[5rem]">
            <ClerkComponent 
              signUpUrl="/sign-up"
              signInUrl="/sign-in"
              redirectUrl="/dashboard"
              afterSignInUrl="/dashboard"
              afterSignUpUrl="/dashboard"
            />
          </div>

          {/* Footer Text */}
          <p className="text-center text-sm text-muted-foreground mb-8 px-4">
            By continuing, you agree to our{' '}
            <a href="/terms" className="underline hover:text-foreground">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="underline hover:text-foreground">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  )
}