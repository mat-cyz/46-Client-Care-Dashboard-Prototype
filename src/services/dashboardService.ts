import { DIMENSIONS, MONTHS, QA_TARGET, RATINGS } from '../data/constants'
import type { DimensionKey, Rating } from '../data/constants'
import { assessments, addDays, DATA_END, DATA_START, datasetMeta } from '../data/mockData'
import type {
  AdvisorRow,
  ChannelRow,
  DashboardData,
  DimensionScores,
  DistributionRow,
  Filters,
  QualityAssessment,
  Summary,
  RankRow,
  TrendPoint,
} from '../types/dashboard'

export interface DashboardDataAdapter {
  getDashboardData(filters: Filters, signal?: AbortSignal): Promise<DashboardData>
}

const ratingPct = Object.fromEntries(RATINGS.map((r) => [r.key, r.pct])) as Record<Rating, number>

const mean = (values: number[]) => (values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0)

function summarize(rows: QualityAssessment[]): Summary {
  const cx = Object.fromEntries(
    DIMENSIONS.map((d) => [d.key, mean(rows.map((r) => ratingPct[r[d.key]]))]),
  ) as DimensionScores
  return {
    volume: rows.length,
    avgQa: mean(rows.map((r) => r.qaScore)),
    passRate: rows.length ? (rows.filter((r) => r.overallPass === 'Yes').length / rows.length) * 100 : 0,
    cx,
  }
}

function groupBy<T extends string>(rows: QualityAssessment[], key: (r: QualityAssessment) => T) {
  const groups = new Map<T, QualityAssessment[]>()
  for (const row of rows) {
    const k = key(row)
    const bucket = groups.get(k)
    if (bucket) bucket.push(row)
    else groups.set(k, [row])
  }
  return groups
}

const basisDate = (r: QualityAssessment, basis: Filters['dateBasis']) => (basis === 'created' ? r.createdDate : r.completedDate)

// Applies every filter except the period so the trend can show every month of the selected years.
function matchesDimensions(r: QualityAssessment, f: Filters) {
  return f.teams.includes(r.team) && f.channels.includes(r.channel) && f.statuses.includes(r.status) && f.managers.includes(r.manager) && f.teamLeads.includes(r.teamLead) && f.advisors.includes(r.advisor)
}

function selectionLabel(f: Filters) {
  const months = f.months.length === MONTHS.length ? 'All months' : f.months.length > 3 ? `${f.months.length} months` : f.months.join(', ')
  const years = f.years.join(', ')
  return `${months || 'No months'} ${years}`.trim()
}

// Rule-based stand-in for a smart narrative: the two largest changes since the prior day.
function todaysBrief(rows: QualityAssessment[], basis: Filters['dateBasis']) {
  const asOf = datasetMeta.dataThrough
  const stats = (day: string) => summarize(rows.filter((r) => basisDate(r, basis) === day))
  const today = stats(asOf)
  const prior = stats(addDays(asOf, -1))
  if (!today.volume || !prior.volume) return { asOf, text: 'Not enough evaluations to compare with yesterday.' }

  const volumeDelta = today.volume - prior.volume
  const qaDelta = today.avgQa - prior.avgQa
  const rateDelta = today.passRate - prior.passRate
  const changes = [
    { score: Math.abs(volumeDelta) / Math.max(prior.volume, 5), text: `evaluation volume ${volumeDelta > 0 ? 'rose' : 'fell'} by ${Math.abs(volumeDelta)} to ${today.volume}`, changed: volumeDelta !== 0 },
    { score: Math.abs(qaDelta) / 10, text: `average QA score ${qaDelta > 0 ? 'improved' : 'dropped'} ${Math.abs(qaDelta).toFixed(1)} pts to ${today.avgQa.toFixed(1)}`, changed: Math.round(Math.abs(qaDelta) * 10) > 0 },
    { score: Math.abs(rateDelta) / 10, text: `overall EE rate ${rateDelta > 0 ? 'improved' : 'dropped'} ${Math.abs(rateDelta).toFixed(0)} pts to ${today.passRate.toFixed(0)}%`, changed: Math.round(Math.abs(rateDelta)) > 0 },
  ]
    .filter((c) => c.changed)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)

  const text = changes.length ? `Since yesterday, ${changes.map((c) => c.text).join(', and ')}.` : 'No material change since yesterday.'
  return { asOf, text }
}

function buildDashboardData(filters: Filters): DashboardData {
  const dimensionRows = assessments.filter((r) => matchesDimensions(r, filters))

  const inPeriod = dimensionRows.filter((r) => {
    const date = basisDate(r, filters.dateBasis)
    return date !== null && filters.years.includes(date.slice(0, 4)) && filters.months.includes(MONTHS[Number(date.slice(5, 7)) - 1])
  })

  const firstKey = DATA_START.slice(0, 7)
  const lastKey = DATA_END.slice(0, 7)
  const trend: TrendPoint[] = MONTHS.flatMap((month, monthIndex) => {
    const mm = String(monthIndex + 1).padStart(2, '0')
    const hasData = filters.years.some((year) => `${year}-${mm}` >= firstKey && `${year}-${mm}` <= lastKey)
    if (!hasData) return []
    const rows = dimensionRows.filter((r) => {
      const date = basisDate(r, filters.dateBasis)
      return date !== null && filters.years.includes(date.slice(0, 4)) && date.slice(5, 7) === mm
    })
    return [{ label: month, avgQa: rows.length ? mean(rows.map((r) => r.qaScore)) : null, volume: rows.length, selected: filters.months.includes(month) }]
  })

  const distribution: DistributionRow[] = DIMENSIONS.map((d) => {
    const row = { dimension: d.label, exceeds: 0, meets: 0, mostly: 0, partial: 0, opportunity: 0 }
    for (const r of inPeriod) row[r[d.key as DimensionKey]] += 1
    if (inPeriod.length) for (const rating of RATINGS) row[rating.key] = (row[rating.key] / inPeriod.length) * 100
    return row
  })

  const rankBy = (key: (r: QualityAssessment) => string): RankRow[] =>
    [...groupBy(inPeriod, key)]
      .map(([name, rows]) => ({ name, rank: 0, ...summarize(rows) }))
      .sort((a, b) => b.avgQa - a.avgQa)
      .map((row, index) => ({ ...row, rank: index + 1 }))
  const managers = rankBy((r) => r.manager)
  const teamLeads = rankBy((r) => r.teamLead)
    .sort((a, b) => b.avgQa - a.avgQa)
    .map((row, index) => ({ ...row, rank: index + 1 }))

  const channels: ChannelRow[] = ['Phone', 'Email', 'Chat'].map((channel) => {
    const rows = inPeriod.filter((r) => r.channel === channel)
    return { channel, interactions: rows.reduce((sum, r) => sum + r.interactions, 0), ...summarize(rows) }
  })

  const summary = summarize(inPeriod)

  const advisors: AdvisorRow[] = [...groupBy(inPeriod, (r) => r.advisor)]
    .map(([advisor, rows]) => {
      const s = summarize(rows)
      const lowest = DIMENSIONS.map((d) => ({ label: d.shortLabel, score: s.cx[d.key] })).reduce((a, b) => (b.score < a.score ? b : a))
      const flag: AdvisorRow['flag'] = s.avgQa < QA_TARGET ? 'At risk' : s.avgQa < summary.avgQa ? 'Watch' : 'On track'
      return {
        advisor,
        manager: rows[0].manager,
        calls: rows.filter((r) => r.channel === 'Phone').length,
        emails: rows.filter((r) => r.channel === 'Email').length,
        chats: rows.filter((r) => r.channel === 'Chat').length,
        lowestDimension: lowest,
        flag,
        ...s,
      }
    })
    .sort((a, b) => a.avgQa - b.avgQa)

  return { summary, trend, distribution, managers, teamLeads, channels, advisors, selectionLabel: selectionLabel(filters), brief: todaysBrief(dimensionRows, filters.dateBasis), meta: datasetMeta }
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

// Swap for an FDP gold-layer API or Power BI semantic-model adapter without touching the UI.
export class MockDashboardAdapter implements DashboardDataAdapter {
  async getDashboardData(filters: Filters, signal?: AbortSignal) {
    await delay(150, signal)
    return buildDashboardData(filters)
  }
}

export const dashboardDataAdapter: DashboardDataAdapter = new MockDashboardAdapter()
