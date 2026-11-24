import { RotateCcw } from 'lucide-react'
import { defaultFilters, filterOptions, hierarchy } from '../data/mockData'
import type { Filters } from '../types/dashboard'
import { teamLabel } from '../utils/format'
import { MultiSelect } from './MultiSelect'

interface FilterBarProps {
  filters: Filters
  onChange: (filters: Filters) => void
}

const teamLeadOptions = (managers: string[]) => filterOptions.teamLeads.filter((lead) => hierarchy.some((h) => h.teamLead === lead && managers.includes(h.manager)))
const advisorOptions = (managers: string[], teamLeads: string[]) =>
  filterOptions.advisors.filter((name) => hierarchy.some((h) => h.advisor === name && managers.includes(h.manager) && teamLeads.includes(h.teamLead)))

// Keeps choices that stay available and selects options that newly appear, so widening a parent filter restores its children.
const carry = (before: readonly string[], after: readonly string[], value: string[]) => after.filter((o) => (before.includes(o) ? value.includes(o) : true))

export function FilterBar({ filters, onChange }: FilterBarProps) {
  const update = <K extends keyof Filters>(key: K, value: Filters[K]) => onChange({ ...filters, [key]: value })

  const leadOptions = teamLeadOptions(filters.managers)
  const advisorChoices = advisorOptions(filters.managers, filters.teamLeads)

  const changeManagers = (managers: string[]) => {
    const teamLeads = carry(leadOptions, teamLeadOptions(managers), filters.teamLeads)
    const advisors = carry(advisorChoices, advisorOptions(managers, teamLeads), filters.advisors)
    onChange({ ...filters, managers, teamLeads, advisors })
  }

  const changeTeamLeads = (teamLeads: string[]) => {
    const advisors = carry(advisorChoices, advisorOptions(filters.managers, teamLeads), filters.advisors)
    onChange({ ...filters, teamLeads, advisors })
  }

  return (
    <section className="filter-bar" aria-label="Dashboard filters">
      <div className="filter-controls">
        <MultiSelect label="Year" options={filterOptions.years} value={filters.years} onChange={(v) => update('years', v)} />
        <MultiSelect label="Month" options={filterOptions.months} value={filters.months} onChange={(v) => update('months', v)} />
        <MultiSelect label="QA Team" options={filterOptions.teams} value={filters.teams} onChange={(v) => update('teams', v)} format={teamLabel} />
        <MultiSelect label="Channel" options={filterOptions.channels} value={filters.channels} onChange={(v) => update('channels', v)} />
        <MultiSelect label="Status" options={filterOptions.statuses} value={filters.statuses} onChange={(v) => update('statuses', v)} />
        <MultiSelect label="Manager" options={filterOptions.managers} value={filters.managers} onChange={changeManagers} />
        <MultiSelect label="Team Lead" options={leadOptions} value={filters.teamLeads} onChange={changeTeamLeads} />
        <MultiSelect label="Advisor" options={advisorChoices} value={filters.advisors} onChange={(v) => update('advisors', v)} />
        <button type="button" className="reset-button" onClick={() => onChange(defaultFilters)}>
          <RotateCcw size={14} aria-hidden="true" />
          Reset
        </button>
      </div>
    </section>
  )
}
