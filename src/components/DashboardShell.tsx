import type { ReactNode } from 'react'
import type { Filters } from '../types/dashboard'
import { FilterBar } from './FilterBar'
import { Sidebar } from './Sidebar'

interface DashboardShellProps {
  filters: Filters
  onFiltersChange: (filters: Filters) => void
  children: ReactNode
}

export function DashboardShell({ filters, onFiltersChange, children }: DashboardShellProps) {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <FilterBar filters={filters} onChange={onFiltersChange} />
        <main id="quality-assessment">{children}</main>
      </div>
    </div>
  )
}
