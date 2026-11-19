import type { ReactNode } from 'react'
import type { PageId } from '../types/navigation'
import { Sidebar } from './Sidebar'

interface DashboardShellProps {
  page: PageId
  onNavigate: (page: PageId) => void
  filterBar: ReactNode
  children: ReactNode
}

export function DashboardShell({ page, onNavigate, filterBar, children }: DashboardShellProps) {
  return (
    <div className="app-shell">
      <Sidebar page={page} onNavigate={onNavigate} />
      <div className="app-main">
        {filterBar}
        <main id="main-content">{children}</main>
      </div>
    </div>
  )
}
