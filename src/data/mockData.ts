import { CHANNELS, MONTHS, RATINGS, STATUSES, TEAMS, YEARS } from './constants'
import type { Channel, Rating, Status, Team } from './constants'
import type { DatasetMeta, Filters, QualityAssessment } from '../types/dashboard'

export const DATA_START = '2024-12-01'
export const DATA_END = '2026-11-30'

interface Advisor {
  name: string
  teamLead: string
  manager: string
  skill: number
}

const ADVISORS: Advisor[] = [
  { name: 'Amelie Laurent', teamLead: 'Claire Dubois', manager: 'Elena Vasquez', skill: 0.45 },
  { name: 'Camille Rousseau', teamLead: 'Claire Dubois', manager: 'Elena Vasquez', skill: 0.2 },
  { name: 'Juliette Marchand', teamLead: 'Claire Dubois', manager: 'Elena Vasquez', skill: -0.15 },
  { name: 'Sophie Bernard', teamLead: 'Victor Lambert', manager: 'Elena Vasquez', skill: 0.05 },
  { name: 'Olivia Chen', teamLead: 'Megan Powell', manager: 'Gregory Hale', skill: 0.55 },
  { name: 'Marcus Whitfield', teamLead: 'Megan Powell', manager: 'Gregory Hale', skill: -0.4 },
  { name: 'Daniel Ortiz', teamLead: 'Megan Powell', manager: 'Gregory Hale', skill: 0.1 },
  { name: 'Priya Nair', teamLead: 'Andre Silva', manager: 'Gregory Hale', skill: 0.3 },
  { name: 'Hannah Brooks', teamLead: 'Rachel Kim', manager: 'Natalie Okafor', skill: -0.25 },
  { name: 'Lucas Moreau', teamLead: 'Rachel Kim', manager: 'Natalie Okafor', skill: 0.0 },
  { name: 'Isabelle Hart', teamLead: 'Rachel Kim', manager: 'Natalie Okafor', skill: 0.35 },
  { name: 'Noah Fischer', teamLead: 'Jordan Reyes', manager: 'Natalie Okafor', skill: -0.55 },
  { name: 'Tessa Aldridge', teamLead: 'Victor Lambert', manager: 'Elena Vasquez', skill: 0.25 },
  { name: 'Rafael Mendes', teamLead: 'Victor Lambert', manager: 'Elena Vasquez', skill: -0.3 },
  { name: 'Yuki Tanaka', teamLead: 'Andre Silva', manager: 'Gregory Hale', skill: 0.4 },
  { name: 'Brianna Cole', teamLead: 'Andre Silva', manager: 'Gregory Hale', skill: -0.1 },
  { name: 'Omar Haddad', teamLead: 'Jordan Reyes', manager: 'Natalie Okafor', skill: 0.15 },
  { name: 'Chloe Winters', teamLead: 'Jordan Reyes', manager: 'Natalie Okafor', skill: -0.45 },
]

const YEAR_SHIFT: Record<string, number> = { '2024': -0.25, '2025': -0.15, '2026': 0 }

const MONTH_SHIFT = [-0.05, 0, 0.05, 0.1, 0.1, 0.15, 0.1, -0.05, 0.05, 0.1, -0.05, 0.2]
const MONTH_VOLUME = [0.9, 0.85, 0.95, 1, 1, 1, 0.95, 0.9, 1, 1.05, 1.2, 1.25]
const TEAM_SHIFT: Record<Team, number> = { 'Team Lead': 0.25, QA: 0.05, Self_Assessment: 0.15, Calibration: -0.25, Nesting: -0.35 }
const TEAM_WEIGHT: Record<Team, number> = { 'Team Lead': 22, QA: 40, Self_Assessment: 15, Calibration: 10, Nesting: 13 }
const CHANNEL_SHIFT: Record<Channel, number> = { Phone: 0, Email: 0.15, Chat: -0.15 }
const CHANNEL_WEIGHT: Record<Channel, number> = { Phone: 45, Email: 30, Chat: 25 }
// Each QA evaluation samples roughly this many handled interactions in its channel.
const INTERACTIONS_PER_EVAL: Record<Channel, number> = { Phone: 18, Email: 12, Chat: 25 }
const DIMENSION_BIAS = { resolution: 0.1, discovery: -0.15, processProcedure: -0.25, communication: 0.15 }

const DAY_MS = 86_400_000
const toMs = (date: string) => Date.parse(`${date}T00:00:00Z`)
export const addDays = (date: string, days: number) => new Date(toMs(date) + days * DAY_MS).toISOString().slice(0, 10)
export const daysBetween = (from: string, to: string) => Math.round((toMs(to) - toMs(from)) / DAY_MS)

export function mulberry32(seed: number) {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const toRating = (z: number): Rating =>
  z > 1.175 ? 'exceeds' : z > -0.05 ? 'meets' : z > -0.915 ? 'mostly' : z > -1.555 ? 'partial' : 'opportunity'

const ratingPoints = Object.fromEntries(RATINGS.map((r) => [r.key, r.points])) as Record<Rating, number>

function generateAssessments(): QualityAssessment[] {
  const rand = mulberry32(46)
  const gauss = () => Math.sqrt(-2 * Math.log(1 - rand())) * Math.cos(2 * Math.PI * rand())
  const pickWeighted = <T extends string>(weights: Record<T, number>): T => {
    const entries = Object.entries(weights) as [T, number][]
    let roll = rand() * entries.reduce((sum, [, w]) => sum + w, 0)
    for (const [key, weight] of entries) {
      roll -= weight
      if (roll < 0) return key
    }
    return entries[0][0]
  }

  const records: QualityAssessment[] = []
  let sequence = 1

  for (let date = DATA_START; date <= DATA_END; date = addDays(date, 1)) {
    const month = Number(date.slice(5, 7)) - 1
    const weekday = new Date(`${date}T00:00:00Z`).getUTCDay()
    const weekend = weekday === 0 || weekday === 6
    const count = Math.round(((weekend ? 6 : 13) * MONTH_VOLUME[month] * ADVISORS.length) / 12 + rand() * 4)

    for (let i = 0; i < count; i++) {
      const advisor = ADVISORS[Math.floor(rand() * ADVISORS.length)]
      const team = pickWeighted(TEAM_WEIGHT)
      const channel = pickWeighted(CHANNEL_WEIGHT)
      const level = advisor.skill + YEAR_SHIFT[date.slice(0, 4)] + MONTH_SHIFT[month] + TEAM_SHIFT[team] + CHANNEL_SHIFT[channel]
      const shared = gauss() * 0.5
      const rate = (bias: number) => toRating(level + bias + shared + gauss() * 0.85)

      const resolution = rate(DIMENSION_BIAS.resolution)
      const discovery = rate(DIMENSION_BIAS.discovery)
      // Process & Procedure has no Exceeds Expectations option, so it tops out at 100%.
      const rawProcessProcedure = rate(DIMENSION_BIAS.processProcedure)
      const processProcedure: Rating = rawProcessProcedure === 'exceeds' ? 'meets' : rawProcessProcedure
      const communication = rate(DIMENSION_BIAS.communication)
      const qaScore = ratingPoints[resolution] + ratingPoints[discovery] + ratingPoints[processProcedure] + ratingPoints[communication]

      let status: Status = 'Completed'
      let completedDate: string | null = addDays(date, 1 + Math.floor(rand() * 5))
      if (completedDate > DATA_END || (daysBetween(date, DATA_END) <= 21 && rand() < 0.3)) {
        status = 'Open'
        completedDate = null
      } else if (rand() < 0.07) {
        status = 'Disputed'
      }

      const interactions = INTERACTIONS_PER_EVAL[channel] + (sequence % 7) - 3
      records.push({
        assessmentId: `QA-${String(sequence++).padStart(6, '0')}`,
        interactions,
        caseNumber: `CS-${10_000_000 + Math.floor(rand() * 89_999_999)}`,
        team,
        status,
        createdDate: date,
        completedDate,
        advisor: advisor.name,
        teamLead: advisor.teamLead,
        manager: advisor.manager,
        channel,
        overallPass: qaScore >= 80 && resolution !== 'opportunity' ? 'Yes' : 'No',
        qaScore,
        resolution,
        discovery,
        processProcedure,
        communication,
      })
    }
  }
  return records
}

export const assessments = generateAssessments()

export const filterOptions = {
  years: YEARS as readonly string[],
  months: MONTHS as readonly string[],
  teams: TEAMS as readonly string[],
  channels: CHANNELS as readonly string[],
  statuses: STATUSES as readonly string[],
  managers: [...new Set(ADVISORS.map((a) => a.manager))].sort() as readonly string[],
  teamLeads: [...new Set(ADVISORS.map((a) => a.teamLead))].sort() as readonly string[],
  advisors: ADVISORS.map((a) => a.name).sort() as readonly string[],
}

// Manager -> Team Lead -> Advisor roster used to cascade the leadership filters.
export const hierarchy = ADVISORS.map((a) => ({ manager: a.manager, teamLead: a.teamLead, advisor: a.name }))

export const defaultFilters: Filters = {
  dateBasis: 'created',
  years: ['2026'],
  months: ['Nov'],
  teams: [...filterOptions.teams],
  channels: [...filterOptions.channels],
  statuses: [...filterOptions.statuses],
  managers: [...filterOptions.managers],
  teamLeads: [...filterOptions.teamLeads],
  advisors: [...filterOptions.advisors],
}

export const datasetMeta: DatasetMeta = {
  lastRefreshed: '2026-11-24T05:52:00-05:00',
  dataThrough: '2026-11-23',
  sources: ['Salesforce', 'Genesys', 'Medallia', 'Emplifi', 'PFS Web Sales', 'Product data'],
}
