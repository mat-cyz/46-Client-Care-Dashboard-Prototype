import type { ReactNode } from 'react'
import { DIMENSIONS, QA_MAX, QA_TARGET } from '../data/constants'
import type { DashboardData } from '../types/dashboard'
import { fmtDate, fmtInt, fmtPct, fmtRefreshed, fmtScore, fmtSigned } from '../utils/format'
import { ChannelChart, DistributionChart, TeamRankChart, TrendChart } from '../components/Charts'
import { Definitions } from '../components/Definitions'
import { KpiCard } from '../components/KpiCard'
import { AdvisorTable, ChannelTable } from '../components/Tables'

type LoadState = 'loading' | 'loaded' | 'error'

function Panel({ title, subtitle, children, className = '' }: { title: string; subtitle?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`panel ${className}`} aria-label={title}>
      <header>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </header>
      {children}
    </section>
  )
}

function Footer({ data }: { data: DashboardData }) {
  const { meta } = data
  return (
    <footer className="footer">
      <p>
        <strong>Last refreshed:</strong> {fmtRefreshed(meta.lastRefreshed)} &middot; <strong>Data through:</strong> {fmtDate(meta.dataThrough)} &middot; Federated Data Platform (FDP) load completes before 5:00 AM Eastern &middot; <strong>Sources:</strong> {meta.sources.join(', ')}
      </p>
      <Definitions />
    </footer>
  )
}

export function QualityAssessmentPage({ data, state, onRetry }: { data: DashboardData | null; state: LoadState; onRetry: () => void }) {
  if (!data) {
    return state === 'error' ? (
      <div className="state-message" role="alert">
        <p>Quality assessment data could not be loaded.</p>
        <button type="button" className="reset-button" onClick={onRetry}>Retry</button>
      </div>
    ) : (
      <div className="state-message" role="status">Loading quality assessment data...</div>
    )
  }

  const { summary, selectionLabel } = data
  const variance = summary.avgQa - QA_TARGET
  const empty = summary.volume === 0
  const cx = (key: (typeof DIMENSIONS)[number]['key']) => summary.cx[key]

  return (
    <div aria-busy={state === 'loading'} className={`page ${state === 'loading' ? 'is-loading' : ''}`}>
      <div className="page-header">
        <div>
          <h1>Quality Assessment Reporting</h1>
          <p>Provides a high-level view of overall Client Care quality performance &middot; {selectionLabel}</p>
        </div>
        <span className="badge">Mock data</span>
      </div>

      {state === 'error' && (
        <div className="state-message inline" role="alert">
          Latest refresh failed; showing the previous result. <button type="button" className="link-button" onClick={onRetry}>Retry</button>
        </div>
      )}

      {empty ? (
        <div className="state-message" role="status">No quality assessments match the selected filters. Adjust or reset the filters to continue.</div>
      ) : (
        <>
          <section className="kpi-grid" aria-label="Executive KPIs">
            <KpiCard className="span-4" label="Average QA Score" value={fmtScore(summary.avgQa)} note={`Range 0-${QA_MAX}`} meter={{ value: summary.avgQa, max: QA_MAX }} />
            <KpiCard className="span-4" label="QA Score Target" value={String(QA_TARGET)} note="Benchmark target" />
            <KpiCard
              className="span-4"
              label="Variance to QA Target"
              value={fmtSigned(variance)}
              note={variance >= 0 ? 'Above target' : 'Below target'}
              tone={variance >= 0 ? 'positive' : 'negative'}
            />
            <KpiCard className="span-6" label="Evaluation Volume" value={fmtInt(summary.volume)} note="Total QA assessments" />
            <KpiCard className="span-6" label="Overall QA Pass Rate" value={fmtPct(summary.passRate)} note='Overall QA = "Yes"' meter={{ value: summary.passRate, max: 100 }} />
            <KpiCard className="span-3" label="Resolution" value={fmtPct(cx('resolution'))} note="Average, 0%-100% range" meter={{ value: cx('resolution'), max: 100 }} />
            <KpiCard className="span-3" label="Discovery" value={fmtPct(cx('discovery'))} note="Average, 0%-100% range" meter={{ value: cx('discovery'), max: 100 }} />
            <KpiCard className="span-3" label="Process & Procedure" value={fmtPct(cx('processProcedure'))} note="Average, 0%-100% range" meter={{ value: cx('processProcedure'), max: 100 }} />
            <KpiCard className="span-3" label="Communication" value={fmtPct(cx('communication'))} note="Average, 0%-100% range" meter={{ value: cx('communication'), max: 100 }} />
          </section>

          <div className="chart-grid">
            <Panel title="Average QA Score by Month" subtitle="Months with data in the selected year(s)">
              <TrendChart points={data.trend} />
            </Panel>
            <Panel title="Quality Distribution" subtitle="Share of evaluations by rating, per Client Experience category">
              <DistributionChart rows={data.distribution} />
            </Panel>
            <Panel title="Team Ranking by QA Score" subtitle="Highest to lowest average QA score">
              <TeamRankChart rows={data.teams} />
            </Panel>
            <Panel title="Channel Performance" subtitle="Phone, Email, and Chat">
              <ChannelChart rows={data.channels} />
              <ChannelTable rows={data.channels} />
            </Panel>
            <Panel title="Advisor Coaching Opportunities" subtitle={`Lowest average QA first. At risk is below the target of ${QA_TARGET}; Watch is below the selection average.`} className="advisors">
              <AdvisorTable rows={data.advisors} />
            </Panel>
          </div>
        </>
      )}

      <Footer data={data} />
    </div>
  )
}
