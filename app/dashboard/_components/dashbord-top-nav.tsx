"use client"

import ModeToggle from '@/components/mode-toggle'
import { UserProfile } from '@/components/user-profile'
import config from '@/config'
import Link from 'next/link'

export default function DashboardTopNav() {
  return (
    <header className="flex h-14 lg:h-[55px] items-center gap-4 border-b px-4">
      <Link href="/dashboard" className="font-semibold text-lg">
        Polybot
      </Link>
      <div className="flex justify-center items-center gap-2 ml-auto">
        <ModeToggle />
        {config?.auth?.enabled && <UserProfile />}
      </div>
    </header>
  )
}