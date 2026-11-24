import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  LabelList,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { CSSProperties, ReactElement } from 'react'
import { DIMENSIONS, QA_MAX, QA_TARGET, RATINGS } from '../data/constants'
import type { ChannelRow, DistributionRow, RankRow, TrendPoint } from '../types/dashboard'
import { fmtInt, fmtPct, fmtScore } from '../utils/format'

const INK = '#070F25'
const NAVY = '#0F1934'
const CORAL = '#FD625E'
const TEAL = '#168980'
const GRID = '#E3E3E3'
const TICK = { fontSize: 12, fill: '#475052' }
const TOOLTIP_STYLE = { border: `1px solid ${GRID}`, borderRadius: 0, fontSize: 12, color: INK }

const asNumber = (value: unknown) => (typeof value === 'number' ? value : Number(value))

// Fixed height by default; fills the panel on the wide canvas (see .chart-plot in App.css).
export function Plot({ height, children }: { height: number; children: ReactElement }) {
  return (
    <div className="chart-plot" style={{ '--plot-h': `${height}px` } as CSSProperties}>
      <div className="chart-plot-inner">
        <ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer>
      </div>
    </div>
  )
}

interface TrendDotProps {
  cx?: number
  cy?: number
  payload?: TrendPoint
}

function TrendDot({ cx, cy, payload }: TrendDotProps) {
  if (cx === undefined || cy === undefined || !payload) return null
  return payload.selected
    ? <circle cx={cx} cy={cy} r={6} fill={NAVY} stroke="#FFFFFF" strokeWidth={2} />
    : <circle cx={cx} cy={cy} r={3} fill="#FFFFFF" stroke={NAVY} strokeWidth={1.5} />
}

export function TrendChart({ points }: { points: TrendPoint[] }) {
  return (
    <div className="chart" role="img" aria-label="Dual-axis line chart of average QA score and evaluation volume by month, with QA target of 80">
      <Plot height={185}>
        <LineChart data={points} margin={{ top: 16, right: 0, bottom: 0, left: -10 }}>
          <CartesianGrid vertical={false} stroke={GRID} />
          <XAxis dataKey="label" interval={0} tick={TICK} tickLine={false} axisLine={{ stroke: GRID }} />
          <YAxis
            yAxisId="qa"
            tick={TICK}
            tickLine={false}
            axisLine={false}
            width={44}
            domain={[(min: number) => Math.floor(Math.min(min, QA_TARGET) - 5), (max: number) => Math.ceil(Math.max(max, QA_TARGET) + 5)]}
          />
          <YAxis yAxisId="volume" orientation="right" tick={{ ...TICK, fill: TEAL }} tickLine={false} axisLine={false} width={44} domain={[0, (max: number) => Math.ceil(max * 1.1)]} />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(value, name) => [name === 'Avg QA Score' ? fmtScore(asNumber(value)) : fmtInt(asNumber(value)), name]}
          />
          <Legend verticalAlign="top" height={20} iconType="plainline" wrapperStyle={{ fontSize: 11 }} />
          <ReferenceLine yAxisId="qa" y={QA_TARGET} stroke={CORAL} strokeDasharray="5 4" label={{ value: `QA Score Target ${QA_TARGET}`, position: 'insideBottomRight', fontSize: 11, fill: '#BB4A4A' }} />
          <Line
            yAxisId="qa"
            type="monotone"
            dataKey="avgQa"
            name="Avg QA Score"
            stroke={NAVY}
            strokeWidth={2}
            connectNulls
            isAnimationActive={false}
            dot={(props: unknown) => {
              const { cx, cy, payload } = props as TrendDotProps
              return <TrendDot key={payload?.label} cx={cx} cy={cy} payload={payload} />
            }}
          />
          <Line yAxisId="volume" type="monotone" dataKey="volume" name="Evaluation Volume" stroke={TEAL} strokeWidth={2} strokeDasharray="2 3" dot={false} isAnimationActive={false} />
        </LineChart>
      </Plot>
      <p className="chart-note">Filled markers show the selected months; the trend ignores the Month filter.</p>
    </div>
  )
}

export function DistributionChart({ rows }: { rows: DistributionRow[] }) {
  return (
    <div className="chart" role="img" aria-label="Stacked bar chart of rating distribution for each Client Experience category">
      <Plot height={150}>
        <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 8, bottom: 0, left: 0 }} barCategoryGap={10}>
          <XAxis type="number" domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={(v: number) => `${v}%`} tick={TICK} tickLine={false} axisLine={{ stroke: GRID }} />
          <YAxis type="category" dataKey="dimension" width={118} tick={{ ...TICK, fill: INK }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            cursor={{ fill: 'rgba(0,0,0,0.04)' }}
            formatter={(value, name) => [fmtPct(asNumber(value)), String(name)]}
          />
          {RATINGS.map((rating) => (
            <Bar key={rating.key} dataKey={rating.key} name={rating.label} stackId="rating" fill={rating.color} isAnimationActive={false}>
              <LabelList
                dataKey={rating.key}
                position="center"
                fill={rating.textColor}
                fontSize={11}
                formatter={(value: unknown) => (asNumber(value) >= 6 ? `${Math.round(asNumber(value))}%` : '')}
              />
            </Bar>
          ))}
        </BarChart>
      </Plot>
      <ul className="legend" aria-label="Rating legend">
        {RATINGS.map((rating) => (
          <li key={rating.key}>
            <i style={{ background: rating.color }} aria-hidden="true" />
            {rating.label}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function LeadershipRankChart({ rows, level }: { rows: RankRow[]; level: string }) {
  const data = rows.map((row) => ({ ...row, label: `#${row.rank} ${row.name}` }))
  return (
    <div className="chart" role="img" aria-label={`Bar chart ranking ${level.toLowerCase()}s by average QA score`}>
      <Plot height={Math.max(150, data.length * 40 + 20)}>
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 36, bottom: 0, left: 0 }} barCategoryGap="25%">
          <CartesianGrid horizontal={false} stroke={GRID} />
          <XAxis type="number" domain={[0, QA_MAX]} ticks={[0, 40, 80, 120]} tick={TICK} tickLine={false} axisLine={{ stroke: GRID }} />
          <YAxis type="category" dataKey="label" width={140} tick={{ ...TICK, fill: INK }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            cursor={{ fill: 'rgba(0,0,0,0.04)' }}
            formatter={(value, _name, item) => [`${fmtScore(asNumber(value))} (${(item.payload as RankRow).volume} evaluations)`, 'Avg QA Score']}
          />
          <ReferenceLine x={QA_TARGET} stroke={CORAL} strokeDasharray="5 4" />
          <Bar dataKey="avgQa" maxBarSize={24} isAnimationActive={false}>
            {data.map((row) => <Cell key={row.name} fill={row.avgQa >= QA_TARGET ? NAVY : CORAL} />)}
            <LabelList dataKey="avgQa" position="right" fontSize={12} fill={INK} formatter={(value: unknown) => fmtScore(asNumber(value))} />
          </Bar>
        </BarChart>
      </Plot>
      <p className="chart-note">Dashed line marks the QA target of {QA_TARGET}; coral bars fall below it.</p>
    </div>
  )
}

export function ChannelChart({ rows }: { rows: ChannelRow[] }) {
  const data = rows.map((row) => ({ channel: row.channel, ...row.cx }))
  return (
    <div className="chart" role="img" aria-label="Clustered bar chart of Client Experience scores by channel">
      <Plot height={150}>
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -10 }} barCategoryGap="22%">
          <CartesianGrid vertical={false} stroke={GRID} />
          <XAxis dataKey="channel" tick={{ ...TICK, fill: INK }} tickLine={false} axisLine={{ stroke: GRID }} />
          <YAxis domain={[0, 120]} ticks={[0, 30, 60, 90, 120]} tickFormatter={(v: number) => `${v}%`} tick={TICK} tickLine={false} axisLine={false} width={44} />
          <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(0,0,0,0.04)' }} formatter={(value, name) => [fmtPct(asNumber(value)), String(name)]} />
          <Legend iconType="square" wrapperStyle={{ fontSize: 12 }} />
          {DIMENSIONS.map((d) => (
            <Bar key={d.key} dataKey={d.key} name={d.label} fill={d.color} isAnimationActive={false} />
          ))}
        </BarChart>
      </Plot>
    </div>
  )
}
