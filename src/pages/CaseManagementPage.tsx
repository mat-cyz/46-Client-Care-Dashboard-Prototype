import { useState } from 'react'
import type { CaseDashboardData } from '../types/cases'
import { fmtInt, fmtPct } from '../utils/format'
import { AgingChart, ReasonBarChart, ResolutionTrendChart, RiskMatrixChart, WorkloadChart } from '../components/CaseCharts'
import { Footer } from '../components/Footer'
import { KpiCard } from '../components/KpiCard'
import type { KpiComparison } from '../components/KpiCard'
import { Panel } from '../components/Panel'
import { SegmentedControl } from '../components/SegmentedControl'

type LoadState = 'loading' | 'loaded' | 'error'

const TREND_VIEWS = ['Week', 'Month'] as const
const WORKLOAD_VIEWS = ['Client Tier', 'Boutique'] as const

const CASE_DEFINITIONS = [
  ['Total Case Count', 'Cases created in the current selection.'],
  ['Open Technical Bugs', 'Open cases with the reason Disconnected / Dead Air or Incomplete Chat.'],
  ['Escalated Case Count', 'Cases that were escalated beyond the first-line team.'],
  ['Requires Follow-Up Case Count', 'Cases flagged as needing further follow-up.'],
  ['First Call Resolution', 'Share of cases resolved at first contact.'],
  ['Case duration', 'Days from creation to closure; for open cases, age as of the last data date.'],
] as const

// Same-period-last-year value and variance; rates are compared in points, counts in percent.
function comparison(current: number, previous: number | undefined, format: (n: number) => string, better: 'higher' | 'lower' | 'neutral', unit: 'percent' | 'points' = 'percent'): KpiComparison {
  if (previous === undefined) return { label: 'SPLY', value: 'N/A', change: null }
  const delta = unit === 'points' ? current - previous : previous === 0 ? NaN : ((current - previous) / previous) * 100
  if (Number.isNaN(delta)) return { label: 'SPLY', value: format(previous), change: null }
  const direction = Math.abs(delta) < 0.05 ? 'flat' : delta > 0 ? 'up' : 'down'
  const good = direction === 'flat' || better === 'neutral' ? null : (direction === 'up') === (better === 'higher')
  return {
    label: 'SPLY',
    value: format(previous),
    change: { text: `${Math.abs(delta).toFixed(1)}${unit === 'points' ? ' pts' : '%'}`, direction, tone: good === null ? 'neutral' : good ? 'good' : 'bad' },
  }
}

export function CaseManagementPage({ data, state, onRetry }: { data: CaseDashboardData | null; state: LoadState; onRetry: () => void }) {
  const [trendView, setTrendView] = useState<(typeof TREND_VIEWS)[number]>('Month')
  const [workloadView, setWorkloadView] = useState<(typeof WORKLOAD_VIEWS)[number]>('Client Tier')

  if (!data) {
    return state === 'error' ? (
      <div className="state-message" role="alert">
        <p>Case management data could not be loaded.</p>
        <button type="button" className="reset-button" onClick={onRetry}>Retry</button>
      </div>
    ) : (
      <div className="state-message" role="status">Loading case management data...</div>
    )
  }

  const { kpis, kpisSply } = data
  const sply = comparison

  return (
    <div aria-busy={state === 'loading'} className={`page ${state === 'loading' ? 'is-loading' : ''}`}>
      <div className="page-header">
        <div>
          <h1>Case Management Reporting</h1>
          <p>Provides a high-level view of case volumes, resolution effectiveness, and operational risk &middot; {data.selectionLabel}</p>
        </div>
        <section className="brief" aria-label="Executive summary, today's brief">
          <div className="brief-label">
            <small>Executive Summary</small>
            <strong>Today&apos;s Brief</strong>
          </div>
          <p>{data.brief.text}</p>
        </section>
        <span className="badge">Mock data</span>
      </div>

      {state === 'error' && (
        <div className="state-message inline" role="alert">
          Latest refresh failed; showing the previous result. <button type="button" className="link-button" onClick={onRetry}>Retry</button>
        </div>
      )}

      {kpis.total === 0 ? (
        <div className="state-message" role="status">No cases match the selected filters. Adjust or reset the filters to continue.</div>
      ) : (
        <>
          <section className="kpi-grid five" aria-label="Executive KPIs">
            <KpiCard className="span-4" label="Total Case Count" value={fmtInt(kpis.total)} note="Cases created in period" comparison={sply(kpis.total, kpisSply?.total, fmtInt, 'neutral')} question="How much work are we handling?" />
            <KpiCard className="span-4" label="Open Technical Bugs" value={fmtInt(kpis.openBugs)} note="Open Dead Air and Incomplete Chat" comparison={sply(kpis.openBugs, kpisSply?.openBugs, fmtInt, 'lower')} question="How many unresolved technical bugs need attention?" />
            <KpiCard className="span-4" label="Escalated Case Count" value={fmtInt(kpis.escalated)} note="Cases escalated" comparison={sply(kpis.escalated, kpisSply?.escalated, fmtInt, 'lower')} question="How many cases require attention at a higher level?" />
            <KpiCard className="span-6" label="Requires Follow-Up Case Count" value={fmtInt(kpis.followUp)} note="Cases flagged for follow-up" comparison={sply(kpis.followUp, kpisSply?.followUp, fmtInt, 'lower')} question="How many cases still need someone to follow up?" />
            <KpiCard className="span-6" label="First Call Resolution" value={fmtPct(kpis.firstCallResolution)} note="Resolved at first contact" comparison={sply(kpis.firstCallResolution, kpisSply?.firstCallResolution, fmtPct, 'higher', 'points')} meter={{ value: kpis.firstCallResolution, max: 100 }} question="How healthy is the operation today?" />
          </section>

          <div className="chart-grid">
            <Panel title="Case Volume by Reason" subtitle="Which case reasons drive the highest volume?">
              <ReasonBarChart rows={data.reasons} />
            </Panel>
            <Panel
              title="Case Resolution Trend"
              subtitle="Are we resolving faster, and is first-contact resolution improving?"
              action={<SegmentedControl label="Trend granularity" options={TREND_VIEWS} value={trendView} onChange={setTrendView} />}
            >
              <ResolutionTrendChart points={trendView === 'Week' ? data.trendWeek : data.trendMonth} />
            </Panel>
            <Panel title="Operational Risk Matrix" subtitle="Which case reasons create the greatest operational burden?" className="feature">
              <RiskMatrixChart points={data.risk} averages={data.riskAverages} />
            </Panel>
            <Panel
              title="Open Workload & Follow-Up"
              subtitle="Which client tiers or boutiques need intervention?"
              action={<SegmentedControl label="Workload grouping" options={WORKLOAD_VIEWS} value={workloadView} onChange={setWorkloadView} />}
            >
              <WorkloadChart rows={workloadView === 'Client Tier' ? data.workloadTier : data.workloadBoutique} />
            </Panel>
            <Panel title="Case Aging Distribution" subtitle="How old are our open cases, and is the backlog under control?">
              <AgingChart rows={data.aging} />
            </Panel>
          </div>
        </>
      )}

      <Footer meta={data.meta} definitions={CASE_DEFINITIONS} />
    </div>
  )
}
