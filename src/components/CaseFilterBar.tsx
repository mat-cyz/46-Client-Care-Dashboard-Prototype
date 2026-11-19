import { RotateCcw } from 'lucide-react'
import { caseFilterOptions, defaultCaseFilters } from '../data/caseData'
import type { CaseFilters } from '../types/cases'
import { MultiSelect } from './MultiSelect'

export function CaseFilterBar({ filters, onChange }: { filters: CaseFilters; onChange: (filters: CaseFilters) => void }) {
  const update = <K extends keyof CaseFilters>(key: K, value: CaseFilters[K]) => onChange({ ...filters, [key]: value })

  return (
    <section className="filter-bar" aria-label="Dashboard filters">
      <div className="filter-controls">
        <MultiSelect label="Year" options={caseFilterOptions.years} value={filters.years} onChange={(v) => update('years', v)} />
        <MultiSelect label="Month" options={caseFilterOptions.months} value={filters.months} onChange={(v) => update('months', v)} />
        <MultiSelect label="Team" options={caseFilterOptions.teams} value={filters.teams} onChange={(v) => update('teams', v)} />
        <MultiSelect label="Channel" options={caseFilterOptions.channels} value={filters.channels} onChange={(v) => update('channels', v)} />
        <MultiSelect label="Client Tier" options={caseFilterOptions.tiers} value={filters.tiers} onChange={(v) => update('tiers', v)} />
        <MultiSelect label="Boutique Location" options={caseFilterOptions.boutiques} value={filters.boutiques} onChange={(v) => update('boutiques', v)} />
        <MultiSelect label="Case Reason" options={caseFilterOptions.types} value={filters.types} onChange={(v) => update('types', v)} />
        <MultiSelect label="Status" options={caseFilterOptions.statuses} value={filters.statuses} onChange={(v) => update('statuses', v)} />
        <button type="button" className="reset-button" onClick={() => onChange(defaultCaseFilters)}>
          <RotateCcw size={14} aria-hidden="true" />
          Reset
        </button>
      </div>
    </section>
  )
}
