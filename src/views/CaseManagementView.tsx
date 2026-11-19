import { useDeferredValue, useEffect, useState } from 'react'
import { CaseFilterBar } from '../components/CaseFilterBar'
import { DashboardShell } from '../components/DashboardShell'
import { defaultCaseFilters } from '../data/caseData'
import { CaseManagementPage } from '../pages/CaseManagementPage'
import { caseDataAdapter } from '../services/caseService'
import type { CaseDashboardData, CaseFilters } from '../types/cases'
import type { PageId } from '../types/navigation'

export function CaseManagementView({ page, onNavigate }: { page: PageId; onNavigate: (page: PageId) => void }) {
  const [filters, setFilters] = useState<CaseFilters>(defaultCaseFilters)
  const deferredFilters = useDeferredValue(filters)
  const [data, setData] = useState<CaseDashboardData | null>(null)
  const [state, setState] = useState<'loading' | 'loaded' | 'error'>('loading')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setState('loading')
    caseDataAdapter
      .getCaseData(deferredFilters, controller.signal)
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
    <DashboardShell page={page} onNavigate={onNavigate} filterBar={<CaseFilterBar filters={filters} onChange={setFilters} />}>
      <CaseManagementPage data={data} state={state} onRetry={() => setAttempt((n) => n + 1)} />
    </DashboardShell>
  )
}
