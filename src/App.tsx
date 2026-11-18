import { useDeferredValue, useEffect, useState } from 'react'
import { DashboardShell } from './components/DashboardShell'
import { defaultFilters } from './data/mockData'
import { QualityAssessmentPage } from './pages/QualityAssessmentPage'
import { dashboardDataAdapter } from './services/dashboardService'
import type { DashboardData, Filters } from './types/dashboard'

function App() {
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
    <DashboardShell filters={filters} onFiltersChange={setFilters}>
      <QualityAssessmentPage data={data} state={state} onRetry={() => setAttempt((n) => n + 1)} />
    </DashboardShell>
  )
}

export default App
