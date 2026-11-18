export const teamLabel = (team: string) => team.replace(/_/g, ' ')

export const fmtScore = (value: number) => value.toFixed(1)

export const fmtPct = (value: number) => `${value.toFixed(1)}%`

export const fmtSigned = (value: number) => `${value >= 0 ? '+' : '-'}${Math.abs(value).toFixed(1)}`

export const fmtInt = (value: number) => value.toLocaleString('en-US')

export function fmtRefreshed(iso: string) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/New_York',
    timeZoneName: 'short',
  }).format(new Date(iso))
}

export function fmtDate(date: string) {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`))
}
