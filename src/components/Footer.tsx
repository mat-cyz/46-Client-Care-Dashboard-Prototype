import type { DatasetMeta } from '../types/dashboard'
import { fmtDate, fmtRefreshed } from '../utils/format'
import { Definitions } from './Definitions'

export function Footer({ meta, definitions }: { meta: DatasetMeta; definitions?: readonly (readonly [string, string])[] }) {
  return (
    <footer className="footer">
      <p>
        <strong>Last refreshed:</strong> {fmtRefreshed(meta.lastRefreshed)} &middot; <strong>Data through:</strong> {fmtDate(meta.dataThrough)} &middot; Federated Data Platform (FDP) load completes before 5:00 AM Eastern &middot; <strong>Sources:</strong> {meta.sources.join(', ')}
      </p>
      <Definitions items={definitions} />
    </footer>
  )
}
