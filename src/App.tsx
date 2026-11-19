import { useEffect, useState } from 'react'
import type { PageId } from './types/navigation'
import { pageFromHash } from './types/navigation'
import { CaseManagementView } from './views/CaseManagementView'
import { QualityAssessmentView } from './views/QualityAssessmentView'

function App() {
  const [page, setPage] = useState<PageId>(() => pageFromHash(window.location.hash))

  useEffect(() => {
    const onHashChange = () => setPage(pageFromHash(window.location.hash))
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const navigate = (next: PageId) => {
    window.location.hash = next
    setPage(next)
  }

  return page === 'case-management'
    ? <CaseManagementView page={page} onNavigate={navigate} />
    : <QualityAssessmentView page={page} onNavigate={navigate} />
}

export default App
