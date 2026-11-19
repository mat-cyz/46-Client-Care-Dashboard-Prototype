import type { Channel, DimensionKey, Rating, Status, Team } from '../data/constants'

export interface QualityAssessment {
  assessmentId: string
  caseNumber: string
  team: Team
  status: Status
  createdDate: string
  completedDate: string | null
  advisor: string
  manager: string
  channel: Channel
  overallPass: 'Yes' | 'No'
  qaScore: number
  resolution: Rating
  discovery: Rating
  processProcedure: Rating
  communication: Rating
}

export type DateBasis = 'created' | 'completed'

export interface Filters {
  dateBasis: DateBasis
  years: string[]
  months: string[]
  teams: string[]
  channels: string[]
  statuses: string[]
  advisors: string[]
}

export type DimensionScores = Record<DimensionKey, number>

export interface Summary {
  volume: number
  avgQa: number
  passRate: number
  cx: DimensionScores
}

export interface TrendPoint {
  label: string
  avgQa: number | null
  volume: number
  selected: boolean
}

export interface DistributionRow {
  dimension: string
  exceeds: number
  meets: number
  mostly: number
  partial: number
  opportunity: number
}

export interface TeamRow extends Summary {
  team: string
  rank: number
}

export interface ChannelRow extends Summary {
  channel: string
}

export interface AdvisorRow extends Summary {
  advisor: string
  manager: string
  lowestDimension: { label: string; score: number }
  flag: 'At risk' | 'Watch' | 'On track'
}

export interface DatasetMeta {
  lastRefreshed: string
  dataThrough: string
  sources: string[]
}

export interface DashboardData {
  summary: Summary
  trend: TrendPoint[]
  distribution: DistributionRow[]
  teams: TeamRow[]
  channels: ChannelRow[]
  advisors: AdvisorRow[]
  selectionLabel: string
  brief: { asOf: string; text: string }
  meta: DatasetMeta
}
