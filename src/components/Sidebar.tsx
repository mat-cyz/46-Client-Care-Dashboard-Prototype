import { useState } from 'react'
import { BookOpen, ClipboardCheck, LayoutDashboard, MessageSquareText, Star, TableProperties, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface NavEntry {
  id: string
  label: string
  icon: LucideIcon
  active?: boolean
  scope?: string
}

const NAVIGATION: NavEntry[] = [
  { id: 'executive-overview', label: 'Executive Overview', icon: LayoutDashboard, scope: 'headline Client Care KPIs for leadership.' },
  { id: 'advisor-performance', label: 'Advisor Performance', icon: Users, scope: 'advisor scorecards, coaching history, and productivity trends.' },
  { id: 'voice-of-customer', label: 'Voice of Customer', icon: MessageSquareText, scope: 'survey and sentiment trends.' },
  { id: 'voice-details', label: 'Voice Details', icon: TableProperties, scope: 'verbatim feedback with case-level drill-through.' },
  { id: 'quality-assessment', label: 'Quality Assessment', icon: ClipboardCheck, active: true },
  { id: 'product-reviews', label: 'Product Reviews', icon: Star, scope: 'review volume, rating trends, and sentiment by product.' },
  { id: 'glossary', label: 'Glossary', icon: BookOpen, scope: 'KPI definitions, data sources, and refresh rules.' },
]

// Logo lives at public/Chanel Logo.png; the sidebar hides it if the file is missing.
function ChanelLogo() {
  const [missing, setMissing] = useState(false)
  if (missing) return null
  return <img className="chanel-mark" src={`${import.meta.env.BASE_URL}Chanel%20Logo.png`} alt="" onError={() => setMissing(true)} />
}

function PlannedItem({ entry }: { entry: NavEntry }) {
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const showTip = (hovered || focused) && !dismissed
  const tipId = `planned-${entry.id}`
  const Icon = entry.icon

  return (
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
        aria-describedby={tipId}
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
        <Icon size={18} aria-hidden="true" />
        <span>
          {entry.label}
          <small>Planned &middot; Coming soon</small>
        </span>
      </button>
      <div id={tipId} role="tooltip" className={`planned-tooltip ${showTip ? 'visible' : ''}`}>
        {entry.label} is planned for Phase 2 and is not available in this prototype. Planned scope: {entry.scope}
      </div>
    </div>
  )
}

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="wordmark">
        <ChanelLogo />
        <span className="wordmark-logo">CHANEL</span>
        <small>CLIENT CARE DASHBOARD</small>
      </div>
      <nav aria-label="Primary navigation">
        {NAVIGATION.map((entry) => {
          if (!entry.active) return <PlannedItem key={entry.id} entry={entry} />
          const Icon = entry.icon
          return (
            <a key={entry.id} className="nav-item nav-active" href="#quality-assessment" aria-current="page">
              <Icon size={18} aria-hidden="true" />
              <span>{entry.label}</span>
            </a>
          )
        })}
      </nav>
    </aside>
  )
}
