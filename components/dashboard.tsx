'use client'

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Bot, Calculator, PenTool } from "lucide-react"
import { useRouter } from "next/navigation"
import { useConversation } from "@/contexts/ConversationContext"

export function DashboardComponent() {
  const router = useRouter()
  const { createNewConversation } = useConversation()

  const handleQuickChat = async () => {
    try {
      await createNewConversation()
      router.push('/dashboard/chat')
    } catch (error) {
      console.error('Error creating new chat:', error)
    }
  }

  const handleSpecialistChat = async (type: 'math' | 'writing') => {
    try {
      await createNewConversation(undefined)
      router.push('/dashboard/chat')
    } catch (error) {
      console.error(`Error creating new ${type} chat:`, error)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <main className="w-full max-w-4xl px-8">
        <div className="space-y-8">
          {/* QuickChat Button */}
          <Card className="w-full overflow-hidden max-w-2xl mx-auto">
            <Button 
              className="w-full h-auto py-8 text-left flex items-center space-x-6 bg-gradient-to-r from-purple-600 to-purple-900 hover:from-purple-700 hover:to-purple-950"
              variant="default"
              onClick={handleQuickChat}
            >
              <div className="bg-white bg-opacity-20 p-3 rounded-full">
                <Bot size={48} className="text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-2 text-white">QuickChat</h2>
                <p className="text-lg text-white text-opacity-90">Utilize all models</p>
              </div>
            </Button>
          </Card>

          {/* Specialist Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {/* Math Specialist */}
            <Card className="overflow-hidden">
              <Button 
                className="w-full h-full py-6 text-left flex items-center space-x-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
                variant="default"
                onClick={() => handleSpecialistChat('math')}
              >
                <div className="bg-white bg-opacity-20 p-2 rounded-full">
                  <Calculator size={36} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1 text-white">Math Specialist</h3>
                  <p className="text-sm text-white text-opacity-90">State of the art model for mathematical solving</p>
                </div>
              </Button>
            </Card>

            {/* Writing Specialist */}
            <Card className="overflow-hidden">
              <Button 
                className="w-full h-full py-6 text-left flex items-center space-x-4 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
                variant="default"
                onClick={() => handleSpecialistChat('writing')}
              >
                <div className="bg-white bg-opacity-20 p-2 rounded-full">
                  <PenTool size={36} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1 text-white">Writing Specialist</h3>
                  <p className="text-sm text-white text-opacity-90">Creative model for literature</p>
                </div>
              </Button>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}