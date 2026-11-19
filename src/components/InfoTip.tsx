import { useId, useState } from 'react'
import { Info } from 'lucide-react'

export function InfoTip({ label, text }: { label: string; text: string }) {
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const tipId = useId()
  const show = (hovered || focused) && !dismissed

  return (
    <span className="info-tip">
      <button
        type="button"
        className="info-tip-button"
        aria-label={label}
        aria-describedby={tipId}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => {
          setHovered(false)
          setDismissed(false)
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false)
          setDismissed(false)
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setDismissed(true)
        }}
      >
        <Info size={15} aria-hidden="true" />
      </button>
      <span id={tipId} role="tooltip" className={`info-tip-text ${show ? 'visible' : ''}`}>
        {text}
      </span>
    </span>
  )
}
