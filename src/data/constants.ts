export const TEAMS = ['Team Lead', 'QA', 'Self_Assessment', 'Calibration', 'Nesting'] as const
export const CHANNELS = ['Phone', 'Email', 'Chat'] as const
export const STATUSES = ['Completed', 'Open', 'Disputed'] as const
export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const
export const YEARS = ['2024', '2025', '2026'] as const

export const QA_TARGET = 80
export const QA_MAX = 135

// Each Client Experience dimension is worth up to 33.75 points; Exceeds scores 135% of the 25-point base so four dimensions total 135.
export const RATINGS = [
  { key: 'exceeds', label: 'Exceeds Expectations', pct: 120, points: 33.75, color: '#003BFF', textColor: '#FFFFFF' },
  { key: 'meets', label: '100% - Meeting All Expectations', pct: 100, points: 25, color: '#8AD4EB', textColor: '#070F25' },
  { key: 'mostly', label: '80% - Mostly Meeting Expectations', pct: 80, points: 20, color: '#B887AD', textColor: '#070F25' },
  { key: 'partial', label: '60% - Partially Meets Expectations', pct: 60, points: 15, color: '#FD625E', textColor: '#070F25' },
  { key: 'opportunity', label: '0% - Opportunity to Improve', pct: 0, points: 0, color: '#000000', textColor: '#FFFFFF' },
] as const

export const DIMENSIONS = [
  { key: 'resolution', label: 'Resolution', color: '#0F1934', maxPct: 120 },
  { key: 'discovery', label: 'Discovery', color: '#8AD4EB', maxPct: 120 },
  { key: 'processProcedure', label: 'Process & Procedure', color: '#B887AD', maxPct: 100 },
  { key: 'communication', label: 'Communication', color: '#FD625E', maxPct: 120 },
] as const

export type Team = (typeof TEAMS)[number]
export type Channel = (typeof CHANNELS)[number]
export type Status = (typeof STATUSES)[number]
export type Month = (typeof MONTHS)[number]
export type Rating = (typeof RATINGS)[number]['key']
export type DimensionKey = (typeof DIMENSIONS)[number]['key']
