import { CircleCheck, Eye, TriangleAlert } from 'lucide-react'
import { QA_TARGET } from '../data/constants'
import type { AdvisorRow, ChannelRow } from '../types/dashboard'
import { fmtInt, fmtPct, fmtScore, fmtSigned } from '../utils/format'

const FLAG_ICON = {
  'At risk': <TriangleAlert size={14} aria-hidden="true" />,
  Watch: <Eye size={14} aria-hidden="true" />,
  'On track': <CircleCheck size={14} aria-hidden="true" />,
}

export function AdvisorTable({ rows }: { rows: AdvisorRow[] }) {
  return (
    <div className="table-wrap">
      <table className="center-cols">
        <caption className="sr-only">Advisors ranked from lowest to highest average QA score</caption>
        <thead>
          <tr>
            <th scope="col">Advisor</th>
            <th scope="col" className="num">Evals</th>
            <th scope="col" className="num">Calls</th>
            <th scope="col" className="num">Emails</th>
            <th scope="col" className="num">Chats</th>
            <th scope="col" className="num">Avg QA</th>
            <th scope="col" className="num">EE Rate</th>
            <th scope="col">Lowest CX Category</th>
            <th scope="col">Coaching</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.advisor}>
              <th scope="row">{row.advisor}</th>
              <td className="num">{fmtInt(row.volume)}</td>
              <td className="num">{fmtInt(row.calls)}</td>
              <td className="num">{fmtInt(row.emails)}</td>
              <td className="num">{fmtInt(row.chats)}</td>
              <td className="num">{fmtScore(row.avgQa)}</td>
              <td className="num">{fmtPct(row.passRate)}</td>
              <td>{row.lowestDimension.label} ({fmtPct(row.lowestDimension.score)})</td>
              <td><span className={`flag flag-${row.flag.replace(' ', '-').toLowerCase()}`}>{FLAG_ICON[row.flag]}{row.flag}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function ChannelTable({ rows }: { rows: ChannelRow[] }) {
  return (
    <div className="table-wrap">
      <table className="center-cols">
        <caption className="sr-only">Channel performance summary</caption>
        <thead>
          <tr>
            <th scope="col">Channel</th>
            <th scope="col" className="num">Evals</th>
            <th scope="col" className="num">Volume</th>
            <th scope="col" className="num">Avg QA</th>
            <th scope="col" className="num">Vs Target</th>
            <th scope="col" className="num">EE Rate</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.channel}>
              <th scope="row">{row.channel}</th>
              <td className="num">{fmtInt(row.volume)}</td>
              <td className="num">{fmtInt(row.interactions)}</td>
              <td className="num">{row.volume ? fmtScore(row.avgQa) : '-'}</td>
              <td className="num">{row.volume ? fmtSigned(row.avgQa - QA_TARGET) : '-'}</td>
              <td className="num">{row.volume ? fmtPct(row.passRate) : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
