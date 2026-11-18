import { useId, useState } from 'react'
import { ArrowDown, ArrowUp, Info } from 'lucide-react'

interface KpiCardProps {
  label: string
  value: string
  note: string
  question: string
  className?: string
  meter?: { value: number; max: number }
  tone?: 'positive' | 'negative'
}

export function KpiCard({ label, value, note, question, className = '', meter, tone }: KpiCardProps) {
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const tipId = useId()
  const showTip = (hovered || focused) && !dismissed

  return (
    <article className={`kpi-card ${className}`}>
      <h3>{label}</h3>
      <button
        type="button"
        className="kpi-info-button"
        aria-label={`Business question for ${label}`}
        aria-describedby={tipId}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => {
          setHovered(false)
          setDismissed(false)
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false)
          setDismissed(false)
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setDismissed(true)
        }}
      >
        <Info size={14} aria-hidden="true" />
      </button>
      <div id={tipId} role="tooltip" className={`kpi-tooltip ${showTip ? 'visible' : ''}`}>
        <strong>Business question</strong>
        {question}
      </div>
      <p className={`kpi-value ${tone ?? ''}`}>
        {tone === 'positive' && <ArrowUp size={20} aria-label="Above target" />}
        {tone === 'negative' && <ArrowDown size={20} aria-label="Below target" />}
        {value}
      </p>
      {meter && (
        <div className="meter" aria-hidden="true">
          <span style={{ width: `${Math.min(100, Math.max(0, (meter.value / meter.max) * 100))}%` }} />
        </div>
      )}
      <small>{note}</small>
    </article>
  )
}
