import { ReactNode } from "react"
import PolybotSidebar from "./_components/polybot-sidebar"
import DashboardTopNav from "./_components/dashbord-top-nav"
import { isAuthorized } from "@/utils/data/user/isAuthorized"
import { redirect } from "next/dist/server/api-utils"
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
      <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
        <PolybotSidebar />
        <DashboardTopNav >
          <main className="flex flex-col gap-4 p-4 lg:gap-6">
            {children}
          </main>
        </DashboardTopNav>
      </div>
    </ConversationProvider>
  )
}
