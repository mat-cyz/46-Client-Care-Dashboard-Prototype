import { useState } from 'react'
import { BookOpen, Briefcase, ClipboardCheck, FileText, Gauge, LayoutDashboard, MessageSquareText, Star, Store, TableProperties, TrendingUp, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { PageId } from '../types/navigation'

interface NavEntry {
  id: string
  label: string
  icon: LucideIcon
  page?: PageId
  scope?: string
}

const NAVIGATION: NavEntry[] = [
  { id: 'executive-overview', label: 'Executive Overview', icon: LayoutDashboard, scope: 'headline Client Care KPIs for leadership.' },
  { id: 'advisor-scorecard', label: 'Advisor Scorecard', icon: Users, scope: 'advisor scorecards, coaching history, and productivity trends.' },
  { id: 'voice-of-customer', label: 'Voice of Customer', icon: MessageSquareText, scope: 'survey and sentiment trends.' },
  { id: 'voice-details', label: 'Voice Details', icon: TableProperties, scope: 'verbatim feedback with case-level drill-through.' },
  { id: 'quality-assessment', label: 'Quality Assessment', icon: ClipboardCheck, page: 'quality-assessment' },
  { id: 'product-reviews', label: 'Product Reviews', icon: Star, scope: 'review volume, rating trends, and sentiment by product.' },
  { id: 'case-management', label: 'Case Management', icon: Briefcase, page: 'case-management' },
  { id: 'sales-influence', label: 'Sales Influence', icon: TrendingUp, scope: 'client care impact on sales and conversion.' },
  { id: 'boutique-collaboration', label: 'Boutique Collaboration', icon: Store, scope: 'client care and boutique handoffs and follow-ups.' },
  { id: 'operational-performance', label: 'Operational Performance', icon: Gauge, scope: 'service levels, handle times, and staffing.' },
  { id: 'knowledge-docs', label: 'Knowledge & Docs', icon: FileText, scope: 'knowledge articles, usage, and documentation gaps.' },
  { id: 'glossary', label: 'Glossary', icon: BookOpen, scope: 'KPI definitions, data sources, and refresh rules.' },
]

// Logo lives at public/CC Logo_F&B.jpg; the sidebar hides it if the file is missing.
function ChanelLogo() {
  const [missing, setMissing] = useState(false)
  if (missing) return null
  return <img className="chanel-mark" src={`${import.meta.env.BASE_URL}CC%20Logo_F&B.jpg`} alt="" onError={() => setMissing(true)} />
}

// Badge lives at public/IT_BI_CERTIFIED_LOGO.png; hidden if the file is missing.
function CertifiedBadge() {
  const [missing, setMissing] = useState(false)
  if (missing) return null
  return (
    <span className="certified-badge" role="img" aria-label="IT BI Certified">
      <img src={`${import.meta.env.BASE_URL}IT_BI_CERTIFIED_LOGO.png`} alt="" onError={() => setMissing(true)} />
    </span>
  )
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

export function Sidebar({ page, onNavigate }: { page: PageId; onNavigate: (page: PageId) => void }) {
  return (
    <aside className="sidebar">
      <div className="wordmark">
        <ChanelLogo />
        <CertifiedBadge />
        <span className="wordmark-logo">CHANEL</span>
        <small>CLIENT CARE SERVICE EXCELLENCE DASHBOARD</small>
        <small className="wordmark-notice">CONFIDENTIAL / INTERNAL USE ONLY</small>
      </div>
      <nav aria-label="Primary navigation">
        {NAVIGATION.map((entry) => {
          const target = entry.page
          if (!target) return <PlannedItem key={entry.id} entry={entry} />
          const Icon = entry.icon
          const active = target === page
          return (
            <a
              key={entry.id}
              className={`nav-item ${active ? 'nav-active' : ''}`}
              href={`#${target}`}
              aria-current={active ? 'page' : undefined}
              onClick={(event) => {
                event.preventDefault()
                onNavigate(target)
              }}
            >
              <Icon size={18} aria-hidden="true" />
              <span>{entry.label}</span>
            </a>
          )
        })}
      </nav>
    </aside>
  )
}
