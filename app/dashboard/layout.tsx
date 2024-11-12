//officialPolyBot/app/dashboard/layout.tsx

import { ReactNode } from "react"
import PolybotSidebar from "./_components/polybot-sidebar"
import DashboardTopNav from "./_components/dashbord-top-nav"
import { isAuthorized } from "@/utils/data/user/isAuthorized"
import { currentUser } from "@clerk/nextjs/server"
import { ConversationProvider } from '@/contexts/ConversationContext';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await currentUser()
  const { authorized, message } = await isAuthorized(user?.id!)
  if (!authorized) {
    console.log('authorized check fired')
  }
  return (
    <ConversationProvider>
      <div className="flex flex-col h-screen w-full overflow-hidden">
        <DashboardTopNav />
        <div className="flex flex-1 overflow-hidden">
          <PolybotSidebar />
          <main className="flex-1 overflow-hidden relative">
            {children}
          </main>
        </div>
      </div>
    </ConversationProvider>
  )
}