import type { Channel, DimensionKey, Rating, Status, Team } from '../data/constants'

export interface QualityAssessment {
  assessmentId: string
  interactions: number
  caseNumber: string
  team: Team
  status: Status
  createdDate: string
  completedDate: string | null
  advisor: string
  teamLead: string
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
  managers: string[]
  teamLeads: string[]
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

export interface RankRow extends Summary {
  name: string
  rank: number
}

export interface ChannelRow extends Summary {
  channel: string
  interactions: number
}

export interface AdvisorRow extends Summary {
  advisor: string
  manager: string
  calls: number
  emails: number
  chats: number
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
  managers: RankRow[]
  teamLeads: RankRow[]
  channels: ChannelRow[]
  advisors: AdvisorRow[]
  selectionLabel: string
  brief: { asOf: string; text: string }
  meta: DatasetMeta
}
