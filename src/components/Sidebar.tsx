import { useState } from 'react'
import { ClipboardCheck, Star } from 'lucide-react'

const PLANNED_GUIDANCE =
  'Product Reviews is planned for Phase 2 and is not available in this prototype. Planned scope: review volume, rating trends, and sentiment by product.'

export function Sidebar() {
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const showTip = (hovered || focused) && !dismissed

  return (
    <aside className="sidebar">
      <div className="wordmark">
        <span className="wordmark-logo" role="img" aria-label="Chanel">CHANEL</span>
        <small>CLIENT CARE DASHBOARD</small>
      </div>
      <nav aria-label="Primary navigation">
        <a className="nav-item nav-active" href="#quality-assessment" aria-current="page">
          <ClipboardCheck size={18} aria-hidden="true" />
          <span>Quality Assessment</span>
        </a>
        <div
          className="nav-planned-wrap"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => {
            setHovered(false)
            setDismissed(false)
          }}
        >
          <button
            type="button"
            className="nav-item nav-planned"
            aria-disabled="true"
            aria-describedby="planned-guidance"
            onClick={(event) => event.preventDefault()}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              setFocused(false)
              setDismissed(false)
            }}
            onKeyDown={(event) => {
              if (event.key === 'Escape') setDismissed(true)
            }}
          >
            <Star size={18} aria-hidden="true" />
            <span>
              Product Reviews
              <small>Coming in Phase 2</small>
            </span>
            <b>Planned</b>
          </button>
          <div id="planned-guidance" role="tooltip" className={`planned-tooltip ${showTip ? 'visible' : ''}`}>
            {PLANNED_GUIDANCE}
          </div>
        </div>
      </nav>
    </aside>
  )
}
