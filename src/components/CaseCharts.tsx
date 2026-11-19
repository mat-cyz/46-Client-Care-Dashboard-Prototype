import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts'
import { CASE_TYPE_COLORS } from '../data/caseTypes'
import type { CaseType } from '../data/caseTypes'
import type { AgingRow, CaseTrendPoint, ReasonRow, RiskPoint, WorkloadRow } from '../types/cases'
import { fmtInt, fmtPct } from '../utils/format'
import { Plot } from './Charts'

const INK = '#070F25'
const NAVY = '#0F1934'
const CORAL = '#FD625E'
const PURPLE = '#B887AD'
const TEAL = '#168980'
const GRID = '#E3E3E3'
const TICK = { fontSize: 12, fill: '#475052' }
const TOOLTIP_STYLE = { border: `1px solid ${GRID}`, borderRadius: 0, fontSize: 12, color: INK }

const asNumber = (value: unknown) => (typeof value === 'number' ? value : Number(value))
const days = (value: number) => `${value.toFixed(1)} days`

// Recharts' default tick wraps long labels onto a second line.
function SingleLineTick({ x, y, payload }: { x?: number | string; y?: number | string; payload?: { value: string } }) {
  return (
    <text x={Number(x) - 4} y={y} dy="0.32em" textAnchor="end" fontSize={11} fill={INK}>{payload?.value}</text>
  )
}

export function ReasonBarChart({ rows }: { rows: ReasonRow[] }) {
  const total = rows.reduce((sum, row) => sum + row.cases, 0)
  return (
    <div className="chart" role="img" aria-label="Horizontal bar chart of case counts by reason">
      <Plot height={260}>
        <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 40, bottom: 0, left: 0 }} barCategoryGap={2}>
          <CartesianGrid horizontal={false} stroke={GRID} />
          <XAxis type="number" tick={TICK} tickLine={false} axisLine={{ stroke: GRID }} />
          <YAxis type="category" dataKey="reason" width={176} tick={SingleLineTick} tickLine={false} axisLine={false} interval={0} />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            cursor={{ fill: 'rgba(0,0,0,0.04)' }}
            formatter={(value) => [`${fmtInt(asNumber(value))} (${fmtPct((asNumber(value) / total) * 100)} of cases)`, 'Cases']}
          />
          <Bar dataKey="cases" fill={NAVY} isAnimationActive={false}>
            <LabelList dataKey="cases" position="right" fontSize={11} fill={INK} formatter={(value: unknown) => fmtInt(asNumber(value))} />
          </Bar>
        </BarChart>
      </Plot>
    </div>
  )
}

export function ResolutionTrendChart({ points }: { points: CaseTrendPoint[] }) {
  return (
    <div className="chart" role="img" aria-label="Dual-axis line chart of average case resolution time and first call resolution">
      <Plot height={200}>
        <LineChart data={points} margin={{ top: 6, right: 0, bottom: 0, left: -10 }}>
          <CartesianGrid vertical={false} stroke={GRID} />
          <XAxis dataKey="label" interval={points.length > 12 ? 1 : 0} tick={TICK} tickLine={false} axisLine={{ stroke: GRID }} />
          <YAxis yAxisId="days" domain={[0, (max: number) => Math.ceil(max * 1.2)]} tick={TICK} tickLine={false} axisLine={false} width={40} />
          <YAxis yAxisId="fcr" orientation="right" domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={(v: number) => `${v}%`} tick={TICK} tickLine={false} axisLine={false} width={42} />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(value, name) => [name === 'First Call Resolution' ? fmtPct(asNumber(value)) : days(asNumber(value)), String(name)]}
          />
          <Legend verticalAlign="bottom" iconType="plainline" wrapperStyle={{ fontSize: 12 }} />
          <Line yAxisId="days" name="Avg Resolution Time" type="monotone" dataKey="avgDays" stroke={NAVY} strokeWidth={2} dot={{ r: 3 }} connectNulls isAnimationActive={false} />
          <Line yAxisId="fcr" name="First Call Resolution" type="monotone" dataKey="fcr" stroke={TEAL} strokeWidth={2} strokeDasharray="6 3" dot={{ r: 3 }} connectNulls isAnimationActive={false} />
        </LineChart>
      </Plot>
    </div>
  )
}

interface RiskTooltipProps {
  active?: boolean
  payload?: ReadonlyArray<{ payload?: RiskPoint }>
}

function RiskTooltip({ active, payload }: RiskTooltipProps) {
  const point = payload?.[0]?.payload
  if (!active || !point) return null
  return (
    <div className="risk-tooltip">
      <strong>{point.type}</strong>
      <span>{fmtInt(point.cases)} cases</span>
      <span>Avg duration {days(point.avgDays)}</span>
      <span>Escalation rate {fmtPct(point.escalationRate)}</span>
    </div>
  )
}

export function RiskMatrixChart({ points, averages }: { points: RiskPoint[]; averages: { avgDays: number; escalationRate: number } }) {
  return (
    <div className="chart" role="img" aria-label="Bubble chart of average case duration against escalation rate by case reason, sized by total cases">
      <Plot height={300}>
        <ScatterChart margin={{ top: 10, right: 16, bottom: 4, left: 0 }}>
          <CartesianGrid stroke={GRID} />
          <XAxis
            type="number"
            dataKey="avgDays"
            name="Avg Case Duration"
            domain={[0, (max: number) => Math.ceil(max * 1.2)]}
            tick={TICK}
            tickLine={false}
            axisLine={{ stroke: GRID }}
            label={{ value: 'Average case duration (days)', position: 'insideBottom', offset: 0, fontSize: 11, fill: '#475052' }}
            height={44}
          />
          <YAxis
            type="number"
            dataKey="escalationRate"
            name="Escalation Rate"
            domain={[0, (max: number) => Math.ceil(max * 1.2)]}
            tickFormatter={(v: number) => `${v}%`}
            tick={TICK}
            tickLine={false}
            axisLine={false}
            width={48}
            label={{ value: 'Escalation rate', angle: -90, position: 'insideLeft', offset: 14, fontSize: 11, fill: '#475052' }}
          />
          <ZAxis type="number" dataKey="cases" range={[160, 1500]} />
          <Tooltip content={<RiskTooltip />} cursor={{ strokeDasharray: '3 3' }} />
          <ReferenceLine x={averages.avgDays} stroke="#7F898A" strokeDasharray="5 4" />
          <ReferenceLine y={averages.escalationRate} stroke="#7F898A" strokeDasharray="5 4" />
          <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
          {points.map((point) => (
            <Scatter key={point.type} name={point.type} data={[point]} fill={CASE_TYPE_COLORS[point.type as CaseType]} fillOpacity={0.8} stroke="#FFFFFF" isAnimationActive={false} />
          ))}
        </ScatterChart>
      </Plot>
      <p className="chart-note">Bubble size is total cases. Dashed lines mark the average duration and escalation rate.</p>
    </div>
  )
}

export function WorkloadChart({ rows }: { rows: WorkloadRow[] }) {
  const crowded = rows.length > 6
  return (
    <div className="chart" role="img" aria-label="Stacked column chart of open, follow-up, and escalated cases">
      <Plot height={200}>
        <BarChart data={rows} margin={{ top: 6, right: 8, bottom: 0, left: -10 }} barCategoryGap="22%">
          <CartesianGrid vertical={false} stroke={GRID} />
          <XAxis
            dataKey="name"
            interval={0}
            tick={{ ...TICK, fontSize: crowded ? 11 : 12, fill: INK }}
            tickLine={false}
            axisLine={{ stroke: GRID }}
            angle={crowded ? -25 : 0}
            textAnchor={crowded ? 'end' : 'middle'}
            height={crowded ? 46 : 28}
          />
          <YAxis tick={TICK} tickLine={false} axisLine={false} width={40} />
          <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(0,0,0,0.04)' }} formatter={(value, name) => [fmtInt(asNumber(value)), String(name)]} />
          <Legend verticalAlign="bottom" iconType="square" wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="open" name="Open" stackId="work" fill={NAVY} isAnimationActive={false} />
          <Bar dataKey="followUp" name="Requires Follow-Up" stackId="work" fill={PURPLE} isAnimationActive={false} />
          <Bar dataKey="escalated" name="Escalated" stackId="work" fill={CORAL} isAnimationActive={false} />
        </BarChart>
      </Plot>
      <p className="chart-note">Open cases only; each case is counted once (Escalated, then Requires Follow-Up, then Open).</p>
    </div>
  )
}

export function AgingChart({ rows }: { rows: AgingRow[] }) {
  return (
    <div className="chart" role="img" aria-label="Column chart of open case counts by age bucket">
      <Plot height={200}>
        <BarChart data={rows} margin={{ top: 16, right: 8, bottom: 0, left: -10 }} barCategoryGap="22%">
          <CartesianGrid vertical={false} stroke={GRID} />
          <XAxis dataKey="bucket" interval={0} tick={{ ...TICK, fill: INK }} tickLine={false} axisLine={{ stroke: GRID }} />
          <YAxis tick={TICK} tickLine={false} axisLine={false} width={40} />
          <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(0,0,0,0.04)' }} formatter={(value) => [fmtInt(asNumber(value)), 'Open cases']} />
          <Bar dataKey="cases" isAnimationActive={false}>
            {rows.map((row) => <Cell key={row.bucket} fill={row.bucket === '15+ Days' ? CORAL : NAVY} />)}
            <LabelList dataKey="cases" position="top" fontSize={11} fill={INK} formatter={(value: unknown) => fmtInt(asNumber(value))} />
          </Bar>
        </BarChart>
      </Plot>
      <p className="chart-note">Age of open cases as of the last data date; 15+ days is flagged as backlog risk.</p>
    </div>
  )
}
