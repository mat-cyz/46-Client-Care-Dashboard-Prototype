import type { Channel } from './constants'

export const CASE_CHANNELS = ['Phone', 'Email', 'Chat', 'Web'] as const
export const CLIENT_TIERS = ['VIC', 'Elite +', 'Elite', 'Upcomer', 'Sophomore', 'Rookie'] as const
export type ClientTier = (typeof CLIENT_TIERS)[number]
export type CaseChannel = Channel | 'Web'

export const CASE_TYPES = [
  'Inventory Inquiry',
  'Chanel.com Order Inquiry',
  'Point of Sale Information',
  'Product Information',
  'Disconnected / Dead Air',
  'Repairs',
  'Missing',
  'Incomplete Chat',
  'Return Inquiry',
  'Return / Exchange',
  'Policy',
  'Purchase Verification',
] as const

export const CASE_TEAMS = ['T-Tec', 'Camelia'] as const
export const CASE_STATUSES = ['New', 'Closed', 'Escalated', 'Auto-Close', 'Spam', 'Duplicate', 'Working', 'Follow-Up Needed'] as const
export const BOUTIQUES = ['New York', 'Beverly Hills', 'Las Vegas', 'Miami', 'Chicago', 'San Francisco', 'Houston', 'Dallas'] as const
export const NO_BOUTIQUE = 'No Boutique'
export const AGING_BUCKETS = ['Same Day', '1-3 Days', '4-7 Days', '8-14 Days', '15+ Days'] as const

// One fixed color per case reason so the risk matrix legend stays stable across filters.
export const CASE_TYPE_COLORS: Record<CaseType, string> = {
  'Inventory Inquiry': '#003BFF',
  'Chanel.com Order Inquiry': '#FD625E',
  'Point of Sale Information': '#000000',
  'Product Information': '#B887AD',
  'Disconnected / Dead Air': '#4AC5BB',
  Repairs: '#BD7150',
  Missing: '#7B4F71',
  'Incomplete Chat': '#8AD4EB',
  'Return Inquiry': '#456A76',
  'Return / Exchange': '#FDAB89',
  Policy: '#168980',
  'Purchase Verification': '#B59525',
}

// Reasons that count toward the Open Technical Bugs KPI.
export const TECHNICAL_REASONS: readonly CaseType[] = ['Disconnected / Dead Air', 'Incomplete Chat']

export type CaseType = (typeof CASE_TYPES)[number]
export type CaseTeam = (typeof CASE_TEAMS)[number]
export type CaseStatus = (typeof CASE_STATUSES)[number]

export interface CaseRecord {
  caseNumber: string
  reason: CaseType
  team: CaseTeam
  boutique: string | null
  channel: CaseChannel
  clientTier: ClientTier
  status: CaseStatus
  createdDate: string
  closedDate: string | null
  escalated: boolean
  requiresFollowUp: boolean
  firstContactResolved: boolean
  // Days from creation to closure, or age as of the last data date for open cases.
  durationDays: number
}
