import { DIMENSIONS, QA_MAX, QA_TARGET } from '../data/constants'
import type { DashboardData } from '../types/dashboard'
import { fmtInt, fmtPct, fmtScore, fmtSigned } from '../utils/format'
import { ChannelChart, DistributionChart, TeamRankChart, TrendChart } from '../components/Charts'
import { Footer } from '../components/Footer'
import { InfoTip } from '../components/InfoTip'
import { KpiCard } from '../components/KpiCard'
import { Panel } from '../components/Panel'
import { AdvisorTable, ChannelTable } from '../components/Tables'

type LoadState = 'loading' | 'loaded' | 'error'

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

      {empty ? (
        <div className="state-message" role="status">No quality assessments match the selected filters. Adjust or reset the filters to continue.</div>
      ) : (
        <>
          <section className="kpi-grid" aria-label="Executive KPIs">
            <KpiCard className="span-4" label="Average QA Score" value={fmtScore(summary.avgQa)} note={`Range 0-${QA_MAX}`} meter={{ value: summary.avgQa, max: QA_MAX }} question="How well are advisors performing against our quality standards overall?" />
            <KpiCard className="span-4" label="QA Score Target" value={String(QA_TARGET)} note="Benchmark target" question="What quality score benchmark are we aiming to meet?" />
            <KpiCard
              className="span-4"
              label="Variance to Target"
              value={fmtSigned(variance)}
              note={variance >= 0 ? 'Above target' : 'Below target'}
              tone={variance >= 0 ? 'positive' : 'negative'}
              question="Are we ahead of or behind our quality target, and by how much?"
            />
            <KpiCard className="span-6" label="Evaluation Volume" value={fmtInt(summary.volume)} note="Total QA assessments" question="How many interactions were evaluated, and is the sample large enough to trust?" />
            <KpiCard className="span-6" label="Overall EE Rate" value={fmtPct(summary.passRate)} note='Overall QA = "Yes"' meter={{ value: summary.passRate, max: 100 }} question="What share of evaluated interactions meet our service standards?" />
            <KpiCard className="span-3" label="Resolution" value={fmtPct(cx('resolution'))} note="Average, 0%-120% range" meter={{ value: cx('resolution'), max: 120 }} question="Are advisors fully resolving what clients came to us for?" />
            <KpiCard className="span-3" label="Discovery" value={fmtPct(cx('discovery'))} note="Average, 0%-120% range" meter={{ value: cx('discovery'), max: 120 }} question="Are advisors asking the right questions to understand each client's need?" />
            <KpiCard className="span-3" label="Process & Procedure" value={fmtPct(cx('processProcedure'))} note="Average, 0%-100% range" meter={{ value: cx('processProcedure'), max: 100 }} question="Are advisors following the required processes and procedures?" />
            <KpiCard className="span-3" label="Communication" value={fmtPct(cx('communication'))} note="Average, 0%-120% range" meter={{ value: cx('communication'), max: 120 }} question="Are advisors communicating clearly and with the right tone?" />
          </section>

          <div className="chart-grid">
            <Panel title="Average QA Score and Evaluation Volume by Month" subtitle="Months with data in the selected year(s)">
              <TrendChart points={data.trend} />
            </Panel>
            <Panel
              title="Quality Distribution"
              subtitle="Share of evaluations by rating, per Client Experience category"
              action={<InfoTip label="About the Exceeds Expectations rating" text="Exceeds Expectations (weight 120) applies to Resolution, Discovery, and Communication only; Process & Procedure tops out at 100%." />}
            >
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

      <Footer meta={data.meta} />
    </div>
  )
}
