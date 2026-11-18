import { ArrowDown, ArrowUp } from 'lucide-react'

interface KpiCardProps {
  label: string
  value: string
  note: string
  className?: string
  meter?: { value: number; max: number }
  tone?: 'positive' | 'negative'
}

export function KpiCard({ label, value, note, className = '', meter, tone }: KpiCardProps) {
  return (
    <article className={`kpi-card ${className}`}>
      <h3>{label}</h3>
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
