import { useEffect, useId, useRef, useState } from 'react'
import { CircleHelp } from 'lucide-react'
import { QA_MAX, QA_TARGET, RATINGS } from '../data/constants'

export const QA_DEFINITIONS = [
  ['Average QA Score', `Mean QA score across evaluations, from 0 to ${QA_MAX}.`],
  ['QA Score Target', `Benchmark of ${QA_TARGET}.`],
  ['Variance to Target', 'Average QA Score minus the QA Score Target.'],
  ['Evaluation Volume', 'Count of QA assessments in the current selection.'],
  ['Overall Pass Rate', 'Share of evaluations where Overall QA is "Yes": QA score of at least 80 and Resolution not rated 0%.'],
  ['Client Experience scores', `Average rating weight for Resolution, Discovery, and Communication (${RATINGS.map((r) => r.pct).join(', ')}; Exceeds Expectations scores 120, so these reach 120%) and for Process & Procedure (no Exceeds option; maximum 100%).`],
] as const

export function Definitions({ items = QA_DEFINITIONS }: { items?: readonly (readonly [string, string])[] }) {
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

  return (
    <div
      className="definitions"
      ref={ref}
      onKeyDown={(event) => {
        if (event.key === 'Escape') setOpen(false)
      }}
    >
      <button type="button" className="definitions-button" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>
        <CircleHelp size={15} aria-hidden="true" />
        DEFINITIONS
      </button>
      {open && (
        <div id={id} role="region" aria-label="Definitions" className="definitions-popover">
          <dl>
            {items.map(([term, text]) => (
              <div key={term}>
                <dt>{term}</dt>
                <dd>{text}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  )
}
