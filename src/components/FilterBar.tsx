import { ChevronDown, RotateCcw } from 'lucide-react'
import { defaultFilters, filterOptions } from '../data/mockData'
import type { DateBasis, Filters } from '../types/dashboard'
import { teamLabel } from '../utils/format'
import { MultiSelect } from './MultiSelect'

interface FilterBarProps {
  filters: Filters
  onChange: (filters: Filters) => void
}

export function FilterBar({ filters, onChange }: FilterBarProps) {
  const update = <K extends keyof Filters>(key: K, value: Filters[K]) => onChange({ ...filters, [key]: value })

  return (
    <section className="filter-bar" aria-label="Dashboard filters">
      <div className="filter-controls">
        <label className="filter-field">
          <span className="filter-label">Date basis</span>
          <div className="select-native">
            <select value={filters.dateBasis} onChange={(event) => update('dateBasis', event.target.value as DateBasis)}>
              <option value="created">Created Date</option>
              <option value="completed">Completed Date</option>
            </select>
            <ChevronDown size={14} aria-hidden="true" />
          </div>
        </label>
        <MultiSelect label="Year" options={filterOptions.years} value={filters.years} onChange={(v) => update('years', v)} />
        <MultiSelect label="Month" options={filterOptions.months} value={filters.months} onChange={(v) => update('months', v)} />
        <MultiSelect label="Team" options={filterOptions.teams} value={filters.teams} onChange={(v) => update('teams', v)} format={teamLabel} />
        <MultiSelect label="Channel" options={filterOptions.channels} value={filters.channels} onChange={(v) => update('channels', v)} />
        <MultiSelect label="Status" options={filterOptions.statuses} value={filters.statuses} onChange={(v) => update('statuses', v)} />
        <MultiSelect label="Advisor" options={filterOptions.advisors} value={filters.advisors} onChange={(v) => update('advisors', v)} />
        <button type="button" className="reset-button" onClick={() => onChange(defaultFilters)}>
          <RotateCcw size={14} aria-hidden="true" />
          Reset
        </button>
      </div>
    </section>
  )
}
