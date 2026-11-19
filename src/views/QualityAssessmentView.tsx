import { useDeferredValue, useEffect, useState } from 'react'
import { DashboardShell } from '../components/DashboardShell'
import { FilterBar } from '../components/FilterBar'
import { defaultFilters } from '../data/mockData'
import { QualityAssessmentPage } from '../pages/QualityAssessmentPage'
import { dashboardDataAdapter } from '../services/dashboardService'
import type { DashboardData, Filters } from '../types/dashboard'
import type { PageId } from '../types/navigation'

export function QualityAssessmentView({ page, onNavigate }: { page: PageId; onNavigate: (page: PageId) => void }) {
  const [filters, setFilters] = useState<Filters>(defaultFilters)
  const deferredFilters = useDeferredValue(filters)
  const [data, setData] = useState<DashboardData | null>(null)
  const [state, setState] = useState<'loading' | 'loaded' | 'error'>('loading')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setState('loading')
    dashboardDataAdapter
      .getDashboardData(deferredFilters, controller.signal)
      .then((result) => {
        setData(result)
        setState('loaded')
      })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === 'AbortError')) setState('error')
      })
    return () => controller.abort()
  }, [deferredFilters, attempt])

  return (
    <DashboardShell page={page} onNavigate={onNavigate} filterBar={<FilterBar filters={filters} onChange={setFilters} />}>
      <QualityAssessmentPage data={data} state={state} onRetry={() => setAttempt((n) => n + 1)} />
    </DashboardShell>
  )
}
