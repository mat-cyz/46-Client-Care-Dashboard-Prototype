import { CHANNELS, MONTHS, RATINGS, STATUSES, TEAMS, YEARS } from './constants'
import type { Channel, Rating, Status, Team } from './constants'
import type { DatasetMeta, Filters, QualityAssessment } from '../types/dashboard'

const DATA_START = '2025-01-01'
export const DATA_END = '2026-12-30'

interface Advisor {
  name: string
  manager: string
  skill: number
}

const ADVISORS: Advisor[] = [
  { name: 'Amelie Laurent', manager: 'Elena Vasquez', skill: 0.45 },
  { name: 'Camille Rousseau', manager: 'Elena Vasquez', skill: 0.2 },
  { name: 'Juliette Marchand', manager: 'Elena Vasquez', skill: -0.15 },
  { name: 'Sophie Bernard', manager: 'Elena Vasquez', skill: 0.05 },
  { name: 'Olivia Chen', manager: 'Gregory Hale', skill: 0.55 },
  { name: 'Marcus Whitfield', manager: 'Gregory Hale', skill: -0.4 },
  { name: 'Daniel Ortiz', manager: 'Gregory Hale', skill: 0.1 },
  { name: 'Priya Nair', manager: 'Gregory Hale', skill: 0.3 },
  { name: 'Hannah Brooks', manager: 'Natalie Okafor', skill: -0.25 },
  { name: 'Lucas Moreau', manager: 'Natalie Okafor', skill: 0.0 },
  { name: 'Isabelle Hart', manager: 'Natalie Okafor', skill: 0.35 },
  { name: 'Noah Fischer', manager: 'Natalie Okafor', skill: -0.55 },
  { name: 'Tessa Aldridge', manager: 'Elena Vasquez', skill: 0.25 },
  { name: 'Rafael Mendes', manager: 'Elena Vasquez', skill: -0.3 },
  { name: 'Yuki Tanaka', manager: 'Gregory Hale', skill: 0.4 },
  { name: 'Brianna Cole', manager: 'Gregory Hale', skill: -0.1 },
  { name: 'Omar Haddad', manager: 'Natalie Okafor', skill: 0.15 },
  { name: 'Chloe Winters', manager: 'Natalie Okafor', skill: -0.45 },
]

const YEAR_SHIFT: Record<string, number> = { '2025': -0.15, '2026': 0 }

const MONTH_SHIFT = [-0.05, 0, 0.05, 0.1, 0.1, 0.15, 0.1, -0.05, 0.05, 0.1, -0.05, 0.2]
const MONTH_VOLUME = [0.9, 0.85, 0.95, 1, 1, 1, 0.95, 0.9, 1, 1.05, 1.2, 1.25]
const TEAM_SHIFT: Record<Team, number> = { 'Team Lead': 0.25, QA: 0.05, Self_Assessment: 0.15, Calibration: -0.25, Nesting: -0.35 }
const TEAM_WEIGHT: Record<Team, number> = { 'Team Lead': 22, QA: 40, Self_Assessment: 15, Calibration: 10, Nesting: 13 }
const CHANNEL_SHIFT: Record<Channel, number> = { Phone: 0, Email: 0.15, Chat: -0.15 }
const CHANNEL_WEIGHT: Record<Channel, number> = { Phone: 45, Email: 30, Chat: 25 }
const DIMENSION_BIAS = { resolution: 0.1, discovery: -0.15, processProcedure: -0.25, communication: 0.15 }

const DAY_MS = 86_400_000
const toMs = (date: string) => Date.parse(`${date}T00:00:00Z`)
const addDays = (date: string, days: number) => new Date(toMs(date) + days * DAY_MS).toISOString().slice(0, 10)
const daysBetween = (from: string, to: string) => Math.round((toMs(to) - toMs(from)) / DAY_MS)

function mulberry32(seed: number) {
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
      const processProcedure = rate(DIMENSION_BIAS.processProcedure)
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

      records.push({
        assessmentId: `QA-${String(sequence++).padStart(6, '0')}`,
        caseNumber: `CS-${10_000_000 + Math.floor(rand() * 89_999_999)}`,
        team,
        status,
        createdDate: date,
        completedDate,
        advisor: advisor.name,
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
  advisors: ADVISORS.map((a) => a.name).sort() as readonly string[],
}

export const defaultFilters: Filters = {
  dateBasis: 'created',
  years: ['2026'],
  months: ['Dec'],
  teams: [...filterOptions.teams],
  channels: [...filterOptions.channels],
  statuses: [...filterOptions.statuses],
  advisors: [...filterOptions.advisors],
}

export const datasetMeta: DatasetMeta = {
  lastRefreshed: '2026-12-31T04:42:00-05:00',
  dataThrough: DATA_END,
  sources: ['Salesforce', 'Genesys', 'Medallia', 'Emplify', 'PFS Web Sales', 'Product data'],
}
