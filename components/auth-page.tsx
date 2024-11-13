'use client'

import { SignIn, SignUp } from "@clerk/nextjs"
import { Bot } from 'lucide-react'

interface AuthPageProps {
  mode: 'sign-in' | 'sign-up'
}

export function AuthPage({ mode }: AuthPageProps) {
  const title = mode === 'sign-in' ? 'Sign in to Polybot' : 'Sign up for Polybot'
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
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-3xl space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="flex items-center gap-2">
              <Bot className="w-8 h-8 text-primary" />
              <span className="text-2xl font-semibold text-primary">Polybot</span>
            </div>
          </div>

          {/* Clerk Auth Component */}
          <div className="bg-card rounded-lg p-4 lg:p-6 shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-center">{title}</h2>
            <ClerkComponent
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "shadow-none p-0",
                  header: "hidden",
                  footer: "hidden"
                }
              }}
              signUpUrl="/sign-up"
              signInUrl="/sign-in"
              redirectUrl="/dashboard"
              afterSignInUrl="/dashboard"
              afterSignUpUrl="/dashboard"
            />
          </div>

          {/* Footer Text */}
          <p className="text-center text-sm text-muted-foreground">
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