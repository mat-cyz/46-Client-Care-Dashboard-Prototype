import { useId, useState } from 'react'
import { ArrowDown, ArrowUp, Info, Minus } from 'lucide-react'

export interface KpiComparison {
  label: string
  value: string
  change: { text: string; direction: 'up' | 'down' | 'flat'; tone: 'good' | 'bad' | 'neutral' } | null
}

interface KpiCardProps {
  label: string
  value: string
  note: string
  question: string
  className?: string
  meter?: { value: number; max: number }
  tone?: 'positive' | 'negative'
  comparison?: KpiComparison
}

const DIRECTION_ICON = { up: ArrowUp, down: ArrowDown, flat: Minus }
const DIRECTION_LABEL = { up: 'Up', down: 'Down', flat: 'No change' }

export function KpiCard({ label, value, note, question, className = '', meter, tone, comparison }: KpiCardProps) {
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
      <div className="kpi-main">
        <p className={`kpi-value ${tone ?? ''}`}>
          {tone === 'positive' && <ArrowUp size={20} aria-label="Above target" />}
          {tone === 'negative' && <ArrowDown size={20} aria-label="Below target" />}
          {value}
        </p>
        {comparison && (
          <div className="kpi-compare">
            <span className="kpi-sply">
              <small>{comparison.label}</small>
              <b>{comparison.value}</b>
            </span>
            {comparison.change && <VarianceChip change={comparison.change} />}
          </div>
        )}
      </div>
      {meter && (
        <div className="meter" aria-hidden="true">
          <span style={{ width: `${Math.min(100, Math.max(0, (meter.value / meter.max) * 100))}%` }} />
        </div>
      )}
      <small>{note}</small>
    </article>
  )
}

function VarianceChip({ change }: { change: NonNullable<KpiComparison['change']> }) {
  const Icon = DIRECTION_ICON[change.direction]
  return (
    <span className={`kpi-variance ${change.tone}`}>
      <Icon size={12} aria-hidden="true" />
      <span className="sr-only">{DIRECTION_LABEL[change.direction]} </span>
      {change.text}
    </span>
  )
}
