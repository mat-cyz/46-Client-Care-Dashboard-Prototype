import { YEARS } from './constants'
import { AGING_BUCKETS, BOUTIQUES, CASE_CHANNELS, CASE_STATUSES, CASE_TEAMS, CASE_TYPES, CLIENT_TIERS, NO_BOUTIQUE } from './caseTypes'
import type { CaseChannel, CaseRecord, CaseStatus, CaseTeam, CaseType, ClientTier } from './caseTypes'
import { DATA_END, DATA_START, addDays, daysBetween, mulberry32 } from './mockData'
import type { CaseFilters } from '../types/cases'

interface TypeProfile {
  weight: number
  meanDays: number
  escalation: number
  firstContact: number
}

const PROFILES: Record<CaseType, TypeProfile> = {
  'Inventory Inquiry': { weight: 14, meanDays: 1, escalation: 0.02, firstContact: 0.9 },
  'Chanel.com Order Inquiry': { weight: 16, meanDays: 2, escalation: 0.06, firstContact: 0.6 },
  'Point of Sale Information': { weight: 6, meanDays: 1, escalation: 0.03, firstContact: 0.85 },
  'Product Information': { weight: 10, meanDays: 1, escalation: 0.02, firstContact: 0.88 },
  'Disconnected / Dead Air': { weight: 6, meanDays: 6, escalation: 0.1, firstContact: 0.3 },
  Repairs: { weight: 8, meanDays: 16, escalation: 0.15, firstContact: 0.1 },
  Missing: { weight: 5, meanDays: 6, escalation: 0.22, firstContact: 0.3 },
  'Incomplete Chat': { weight: 5, meanDays: 5, escalation: 0.08, firstContact: 0.3 },
  'Return Inquiry': { weight: 9, meanDays: 2, escalation: 0.05, firstContact: 0.7 },
  'Return / Exchange': { weight: 12, meanDays: 5, escalation: 0.12, firstContact: 0.35 },
  Policy: { weight: 5, meanDays: 3, escalation: 0.08, firstContact: 0.6 },
  'Purchase Verification': { weight: 6, meanDays: 4, escalation: 0.18, firstContact: 0.45 },
}

const TEAM_WEIGHT: Record<CaseTeam, number> = { 'T-Tec': 55, Camelia: 45 }
const CHANNEL_WEIGHT: Record<CaseChannel, number> = { Phone: 40, Email: 30, Chat: 30, Web: 4 }
const CHANNEL_FIRST_CONTACT: Record<CaseChannel, number> = { Phone: 0.05, Email: -0.1, Chat: 0.02, Web: -0.05 }
const MONTH_VOLUME = [0.9, 0.85, 0.95, 1, 1, 1, 0.95, 0.9, 1, 1.05, 1.2, 1.25]

const TIER_WEIGHT: Record<ClientTier, number> = { VIC: 6, 'Elite +': 9, Elite: 15, Upcomer: 20, Sophomore: 22, Rookie: 28 }

function pickTier(roll: number): ClientTier {
  let remaining = roll * 100
  for (const tier of CLIENT_TIERS) {
    remaining -= TIER_WEIGHT[tier]
    if (remaining < 0) return tier
  }
  return 'Rookie'
}

function generateCases(): CaseRecord[] {
  const rand = mulberry32(2026)
  const gauss = () => Math.sqrt(-2 * Math.log(1 - rand())) * Math.cos(2 * Math.PI * rand())
  const pick = <T extends string>(weights: Record<T, number>): T => {
    const entries = Object.entries(weights) as [T, number][]
    let roll = rand() * entries.reduce((sum, [, w]) => sum + w, 0)
    for (const [key, weight] of entries) {
      roll -= weight
      if (roll < 0) return key
    }
    return entries[0][0]
  }
  const typeWeights = Object.fromEntries(CASE_TYPES.map((t) => [t, PROFILES[t].weight])) as Record<CaseType, number>
  // Separate stream so assigning statuses leaves the rest of the case data unchanged.
  const statusRand = mulberry32(31)
  const tierRand = mulberry32(47)

  const cases: CaseRecord[] = []
  let sequence = 1

  for (let date = DATA_START; date <= DATA_END; date = addDays(date, 1)) {
    const month = Number(date.slice(5, 7)) - 1
    const monthsIn = (Number(date.slice(0, 4)) - 2024) * 12 + month - 11
    const weekday = new Date(`${date}T00:00:00Z`).getUTCDay()
    const count = Math.round((weekday === 0 || weekday === 6 ? 20 : 42) * MONTH_VOLUME[month] + rand() * 6)
    const improvement = 1.3 - monthsIn * 0.014
    const age = daysBetween(date, DATA_END)

    for (let i = 0; i < count; i++) {
      const reason = pick(typeWeights)
      const profile = PROFILES[reason]
      const channel = pick(CHANNEL_WEIGHT)
      let team = pick(TEAM_WEIGHT)
      if ((reason === 'Return Inquiry' || reason === 'Return / Exchange' || reason === 'Repairs') && rand() < 0.6) team = 'Camelia'
      if ((reason === 'Disconnected / Dead Air' || reason === 'Incomplete Chat') && rand() < 0.7) team = 'T-Tec'
      const boutique = rand() < 0.3 ? BOUTIQUES[Math.floor(rand() * BOUTIQUES.length)] : null

      const firstContactChance = Math.min(0.95, Math.max(0, profile.firstContact + CHANNEL_FIRST_CONTACT[channel] + monthsIn * 0.004))
      const firstContact = rand() < firstContactChance
      const duration = firstContact
        ? (age === 0 || rand() < 0.7 ? 0 : 1)
        : Math.max(0, Math.round(profile.meanDays * improvement * Math.exp(gauss() * 0.55 - 0.15)))

      const stuckChance = age <= 14 ? 0.06 : age <= 60 ? 0.03 : 0.015
      const open = duration > age || (!firstContact && age > 3 && rand() < stuckChance)
      const escalated = rand() < profile.escalation * (open && age > 7 ? 2 : 1)

      const requiresFollowUp = rand() < (open ? 0.25 : 0.09)

      // Unresolved cases are New, Working, Follow-Up Needed, or Escalated; resolved cases end as Closed, Auto-Close, Spam, or Duplicate.
      let status: CaseStatus
      if (open) status = escalated ? 'Escalated' : requiresFollowUp ? 'Follow-Up Needed' : age <= 2 ? 'New' : 'Working'
      else {
        const roll = statusRand()
        status = roll < 0.05 ? 'Auto-Close' : roll < 0.08 ? 'Spam' : roll < 0.11 ? 'Duplicate' : 'Closed'
      }

      cases.push({
        caseNumber: `CASE-${String(sequence++).padStart(7, '0')}`,
        reason,
        team,
        boutique,
        channel,
        clientTier: pickTier(tierRand()),
        status,
        createdDate: date,
        closedDate: open ? null : addDays(date, duration),
        escalated,
        requiresFollowUp,
        firstContactResolved: !open && firstContact,
        durationDays: open ? age : duration,
      })
    }
  }
  return cases
}

let cache: CaseRecord[] | null = null
export const getCases = () => (cache ??= generateCases())

export const caseFilterOptions = {
  years: YEARS as readonly string[],
  months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as readonly string[],
  teams: CASE_TEAMS as readonly string[],
  channels: CASE_CHANNELS as readonly string[],
  tiers: CLIENT_TIERS as readonly string[],
  boutiques: [...BOUTIQUES, NO_BOUTIQUE] as readonly string[],
  types: CASE_TYPES as readonly string[],
  statuses: CASE_STATUSES as readonly string[],
}

export const defaultCaseFilters: CaseFilters = {
  years: ['2026'],
  months: ['Nov'],
  teams: [...caseFilterOptions.teams],
  channels: [...caseFilterOptions.channels],
  tiers: [...caseFilterOptions.tiers],
  boutiques: [...caseFilterOptions.boutiques],
  types: [...caseFilterOptions.types],
  statuses: [...caseFilterOptions.statuses],
}

export { AGING_BUCKETS }
