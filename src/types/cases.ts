import type { DatasetMeta } from './dashboard'

export interface CaseFilters {
  years: string[]
  months: string[]
  teams: string[]
  channels: string[]
  tiers: string[]
  boutiques: string[]
  types: string[]
  statuses: string[]
}

export interface CaseKpis {
  total: number
  openBugs: number
  escalated: number
  followUp: number
  firstCallResolution: number
}

export interface ReasonRow {
  reason: string
  cases: number
}

export interface CaseTrendPoint {
  label: string
  avgDays: number | null
  fcr: number | null
  cases: number
}

export interface RiskPoint {
  type: string
  cases: number
  avgDays: number
  escalationRate: number
}

export interface WorkloadRow {
  name: string
  open: number
  followUp: number
  escalated: number
}

export interface AgingRow {
  bucket: string
  cases: number
}

export interface CaseDashboardData {
  kpis: CaseKpis
  kpisSply: CaseKpis | null
  brief: { asOf: string; text: string }
  reasons: ReasonRow[]
  trendWeek: CaseTrendPoint[]
  trendMonth: CaseTrendPoint[]
  risk: RiskPoint[]
  riskAverages: { avgDays: number; escalationRate: number }
  workloadTier: WorkloadRow[]
  workloadBoutique: WorkloadRow[]
  aging: AgingRow[]
  openCases: number
  selectionLabel: string
  meta: DatasetMeta
}
