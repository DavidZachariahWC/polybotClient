'use client'

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Bot, Calculator, PenTool } from "lucide-react"

export function DashboardComponent() {
  return (
    <div className="min-h-screen bg-background p-8">
      <main className="container mx-auto max-w-4xl">
        <div className="space-y-8">
          {/* QuickChat Button */}
          <Card className="w-full overflow-hidden">
            <Button 
              className="w-full h-auto py-8 text-left flex items-center space-x-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              variant="default"
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Math Specialist */}
            <Card className="overflow-hidden">
              <Button 
                className="w-full h-full py-6 text-left flex items-center space-x-4 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700"
                variant="default"
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
                className="w-full h-full py-6 text-left flex items-center space-x-4 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700"
                variant="default"
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