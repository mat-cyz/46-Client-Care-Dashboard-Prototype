import { useEffect, useId, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface MultiSelectProps {
  label: string
  options: readonly string[]
  value: string[]
  onChange: (value: string[]) => void
  format?: (option: string) => string
}

export function MultiSelect({ label, options, value, onChange, format = (option) => option }: MultiSelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const id = useId()

  useEffect(() => {
    if (!open) return
    const onDown = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const allSelected = value.length === options.length
  const summary = allSelected ? 'All' : value.length === 0 ? 'None' : value.length === 1 ? format(value[0]) : `${value.length} selected`

  const toggle = (option: string) => {
    const next = new Set(value)
    if (next.has(option)) next.delete(option)
    else next.add(option)
    onChange(options.filter((o) => next.has(o)))
  }

  return (
    <div
      className="filter-field"
      ref={ref}
      onKeyDown={(event) => {
        if (event.key === 'Escape') setOpen(false)
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
      }}
    >
      <span id={`${id}-label`} className="filter-label">{label}</span>
      <button
        type="button"
        className={`select-trigger ${open ? 'open' : ''}`}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={`${id}-menu`}
        aria-labelledby={`${id}-label ${id}-value`}
        onClick={() => setOpen(!open)}
      >
        <span id={`${id}-value`}>{summary}</span>
        <ChevronDown size={14} aria-hidden="true" />
      </button>
      {open && (
        <div id={`${id}-menu`} role="group" aria-label={label} className="select-menu">
          <label className="select-option select-all">
            <input type="checkbox" checked={allSelected} onChange={() => onChange(allSelected ? [] : [...options])} />
            <span>Select all</span>
          </label>
          {options.map((option) => (
            <label key={option} className="select-option">
              <input type="checkbox" checked={value.includes(option)} onChange={() => toggle(option)} />
              <span>{format(option)}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
