export type PageId = 'quality-assessment' | 'case-management'

export const PAGE_IDS: readonly PageId[] = ['quality-assessment', 'case-management']

export function pageFromHash(hash: string): PageId {
  const id = hash.replace(/^#/, '')
  return PAGE_IDS.find((page) => page === id) ?? 'quality-assessment'
}
