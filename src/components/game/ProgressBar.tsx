import { useCabinetStore, STATUS_COLORS, STATUS_LABELS } from '../../store/cabinetStore'
import type { GameStatus } from '../../types'

export function ProgressBar() {
  const getStats = useCabinetStore(s => s.getStats)
  const stats = getStats()
  const { total, unplayed, in_progress, completed, hundred_percent } = stats
  if (total === 0) return null

  const segments: { key: GameStatus; value: number }[] = [
    { key: 'unplayed', value: unplayed },
    { key: 'in_progress', value: in_progress },
    { key: 'completed', value: completed },
    { key: 'hundred_percent', value: hundred_percent },
  ]

  const completionPct = Math.round(((completed + hundred_percent) / total) * 100)

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px', marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 11, letterSpacing: 1.5, color: 'var(--muted)', fontWeight: 600 }}>COLLECTION PROGRESS</span>
        <span style={{ fontFamily: 'Space Grotesk', fontSize: 22, color: 'var(--accent)', letterSpacing: 1 }}>{completionPct}% COMPLETE</span>
      </div>

      <div style={{ height: 8, borderRadius: 4, background: 'var(--surface2)', overflow: 'hidden', display: 'flex', gap: 1, marginBottom: 12 }}>
        {segments.filter(s => s.value > 0).map(seg => (
          <div key={seg.key} style={{ height: '100%', width: `${(seg.value / total) * 100}%`, background: STATUS_COLORS[seg.key], transition: 'width 0.5s ease', borderRadius: 4 }} />
        ))}
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {segments.map(seg => (
          <div key={seg.key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: STATUS_COLORS[seg.key], flexShrink: 0 }} />
            <span style={{ color: 'var(--muted)', fontSize: 12 }}>{STATUS_LABELS[seg.key]}</span>
            <span style={{ color: 'var(--text)', fontSize: 12, fontWeight: 600 }}>{seg.value}</span>
          </div>
        ))}
        <div style={{ marginLeft: 'auto', color: 'var(--muted)', fontSize: 12 }}>{total} total</div>
      </div>
    </div>
  )
}