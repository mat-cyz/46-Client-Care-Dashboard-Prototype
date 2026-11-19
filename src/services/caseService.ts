import { MONTHS } from '../data/constants'
import { AGING_BUCKETS, BOUTIQUES, CASE_TYPES, CLIENT_TIERS, NO_BOUTIQUE, TECHNICAL_REASONS } from '../data/caseTypes'
import type { CaseRecord } from '../data/caseTypes'
import { getCases } from '../data/caseData'
import { DATA_END, DATA_START, addDays, datasetMeta } from '../data/mockData'
import type {
  AgingRow,
  CaseDashboardData,
  CaseFilters,
  CaseKpis,
  CaseTrendPoint,
  ReasonRow,
  RiskPoint,
  WorkloadRow,
} from '../types/cases'

export interface CaseDataAdapter {
  getCaseData(filters: CaseFilters, signal?: AbortSignal): Promise<CaseDashboardData>
}

const mean = (values: number[]) => (values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0)
const percent = (part: number, whole: number) => (whole ? (part / whole) * 100 : 0)
const monthLabel = (date: string) => MONTHS[Number(date.slice(5, 7)) - 1]

function weekStart(date: string) {
  const weekday = new Date(`${date}T00:00:00Z`).getUTCDay()
  return addDays(date, -((weekday + 6) % 7))
}

// Resolution time is attributed to the period a case closed in; FCR to the period it was created in.
function trendPoint(label: string, created: CaseRecord[], closedInPeriod: CaseRecord[]): CaseTrendPoint {
  return {
    label,
    avgDays: closedInPeriod.length ? mean(closedInPeriod.map((r) => r.durationDays)) : null,
    fcr: created.length ? percent(created.filter((r) => r.firstContactResolved).length, created.length) : null,
    cases: created.length,
  }
}

function agingBucket(days: number) {
  return days === 0 ? 0 : days <= 3 ? 1 : days <= 7 ? 2 : days <= 14 ? 3 : 4
}

interface DayStats {
  newCases: number
  escalations: number
  openBugs: number
  openCases: number
  fcr: number
}

function dayStats(rows: CaseRecord[], day: string): DayStats {
  const created = rows.filter((c) => c.createdDate === day)
  const openAsOf = rows.filter((c) => c.createdDate <= day && (c.closedDate === null || c.closedDate > day))
  return {
    newCases: created.length,
    escalations: created.filter((c) => c.escalated).length,
    openBugs: openAsOf.filter((c) => TECHNICAL_REASONS.includes(c.reason)).length,
    openCases: openAsOf.length,
    fcr: percent(created.filter((c) => c.firstContactResolved).length, created.length),
  }
}

// Rule-based stand-in for the Power BI smart narrative: the two largest changes since the prior day.
function todaysBrief(rows: CaseRecord[]) {
  const asOf = datasetMeta.dataThrough
  const today = dayStats(rows, asOf)
  const prior = dayStats(rows, addDays(asOf, -1))
  const counts = [
    ['new cases', 'newCases'],
    ['escalations', 'escalations'],
    ['open technical bugs', 'openBugs'],
    ['open cases', 'openCases'],
  ] as const

  const changes = [
    ...counts.map(([label, key]) => {
      const delta = today[key] - prior[key]
      return { score: Math.abs(delta) / Math.max(prior[key], 5), text: `${label} ${delta > 0 ? 'rose' : 'fell'} by ${Math.abs(delta)} to ${today[key]}`, changed: delta !== 0 }
    }),
    (() => {
      const delta = today.fcr - prior.fcr
      return { score: Math.abs(delta) / 10, text: `first call resolution ${delta > 0 ? 'improved' : 'dropped'} ${Math.abs(delta).toFixed(0)} pts to ${today.fcr.toFixed(0)}%`, changed: Math.round(Math.abs(delta)) > 0 }
    })(),
  ]
    .filter((c) => c.changed)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)

  const text = changes.length ? `Since yesterday, ${changes.map((c) => c.text).join(', and ')}.` : 'No material change since yesterday.'
  return { asOf, text }
}

function selectionLabel(f: CaseFilters) {
  const months = f.months.length === MONTHS.length ? 'All months' : f.months.length > 3 ? `${f.months.length} months` : f.months.join(', ')
  return `${months || 'No months'} ${f.years.join(', ')}`.trim()
}

// Open cases split into mutually exclusive buckets: Escalated, then Requires Follow-Up, then other open.
function workloadRows(names: readonly string[], open: CaseRecord[], key: (r: CaseRecord) => string | null): WorkloadRow[] {
  return names
    .map((name) => {
      const rows = open.filter((r) => key(r) === name)
      const escalated = rows.filter((r) => r.escalated).length
      const followUp = rows.filter((r) => !r.escalated && r.requiresFollowUp).length
      return { name, escalated, followUp, open: rows.length - escalated - followUp }
    })
    .filter((row) => row.open + row.followUp + row.escalated > 0)
}

// Open bugs are counted as of `asOf` so the prior-year comparison uses the same point in the year.
function kpisFor(rows: CaseRecord[], asOf: string): CaseKpis {
  return {
    total: rows.length,
    openBugs: rows.filter((c) => TECHNICAL_REASONS.includes(c.reason) && (c.closedDate === null || c.closedDate > asOf)).length,
    escalated: rows.filter((c) => c.escalated).length,
    followUp: rows.filter((c) => c.requiresFollowUp).length,
    firstCallResolution: percent(rows.filter((c) => c.firstContactResolved).length, rows.length),
  }
}

function buildCaseData(filters: CaseFilters): CaseDashboardData {
  const base = getCases().filter(
    (c) => filters.teams.includes(c.team) && filters.channels.includes(c.channel) && filters.tiers.includes(c.clientTier) && filters.boutiques.includes(c.boutique ?? NO_BOUTIQUE) && filters.types.includes(c.reason) && filters.statuses.includes(c.status),
  )
  const periodRows = (years: string[]) => base.filter((c) => years.includes(c.createdDate.slice(0, 4)) && filters.months.includes(monthLabel(c.createdDate)))
  const inPeriod = periodRows(filters.years)
  const open = inPeriod.filter((c) => c.closedDate === null)

  const kpis = kpisFor(inPeriod, DATA_END)
  const lastYearRows = periodRows(filters.years.map((y) => String(Number(y) - 1)))
  const kpisSply = lastYearRows.length ? kpisFor(lastYearRows, `${Number(DATA_END.slice(0, 4)) - 1}${DATA_END.slice(4)}`) : null

  const reasons: ReasonRow[] = CASE_TYPES.map((reason) => ({ reason: reason as string, cases: inPeriod.filter((c) => c.reason === reason).length }))
    .filter((row) => row.cases > 0)
    .sort((a, b) => b.cases - a.cases)

  const firstKey = DATA_START.slice(0, 7)
  const lastKey = DATA_END.slice(0, 7)
  const trendMonth: CaseTrendPoint[] = MONTHS.flatMap((month, index) => {
    const mm = String(index + 1).padStart(2, '0')
    if (!filters.years.some((y) => `${y}-${mm}` >= firstKey && `${y}-${mm}` <= lastKey)) return []
    const rows = base.filter((c) => filters.years.includes(c.createdDate.slice(0, 4)) && c.createdDate.slice(5, 7) === mm)
    const closed = base.filter((c) => c.closedDate !== null && filters.years.includes(c.closedDate.slice(0, 4)) && c.closedDate.slice(5, 7) === mm)
    return [trendPoint(month, rows, closed)]
  })

  const weeks = new Map<string, CaseRecord[]>()
  for (const c of inPeriod) {
    const key = weekStart(c.createdDate)
    const bucket = weeks.get(key)
    if (bucket) bucket.push(c)
    else weeks.set(key, [c])
  }
  const trendWeek: CaseTrendPoint[] = [...weeks.keys()]
    .sort()
    .map((key) => trendPoint(`${monthLabel(key)} ${Number(key.slice(8, 10))}`, weeks.get(key) ?? [], base.filter((c) => c.closedDate !== null && weekStart(c.closedDate) === key)))

  const risk: RiskPoint[] = CASE_TYPES.flatMap((type) => {
    const rows = inPeriod.filter((c) => c.reason === type)
    if (!rows.length) return []
    const closed = rows.filter((c) => c.closedDate !== null)
    return [{ type: type as string, cases: rows.length, avgDays: mean(closed.map((c) => c.durationDays)), escalationRate: percent(rows.filter((c) => c.escalated).length, rows.length) }]
  })
  const closedAll = inPeriod.filter((c) => c.closedDate !== null)
  const riskAverages = { avgDays: mean(closedAll.map((c) => c.durationDays)), escalationRate: percent(kpis.escalated, inPeriod.length) }

  const aging: AgingRow[] = AGING_BUCKETS.map((bucket, index) => ({ bucket: bucket as string, cases: open.filter((c) => agingBucket(c.durationDays) === index).length }))

  return {
    kpis,
    kpisSply,
    brief: todaysBrief(base),
    reasons,
    trendWeek,
    trendMonth,
    risk,
    riskAverages,
    workloadTier: workloadRows(CLIENT_TIERS, open, (c) => c.clientTier),
    workloadBoutique: workloadRows(BOUTIQUES, open, (c) => c.boutique),
    aging,
    openCases: open.length,
    selectionLabel: selectionLabel(filters),
    meta: datasetMeta,
  }
}

function delay(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException('Aborted', 'AbortError'))
    const timer = setTimeout(resolve, ms)
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer)
        reject(new DOMException('Aborted', 'AbortError'))
      },
      { once: true },
    )
  })
}

// Swap for a Salesforce Case gold-layer API without touching the UI.
export class MockCaseAdapter implements CaseDataAdapter {
  async getCaseData(filters: CaseFilters, signal?: AbortSignal) {
    await delay(150, signal)
    return buildCaseData(filters)
  }
}

export const caseDataAdapter: CaseDataAdapter = new MockCaseAdapter()
