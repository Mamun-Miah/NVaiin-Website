interface StatusBadgeProps {
  status: string
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  confirmed: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  processing: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  shipped: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  delivered: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  cancelled: 'bg-red-500/10 text-nv-red border-red-500/30',
  refunded: 'bg-red-500/10 text-nv-red border-red-500/30',
}

const DEFAULT_STYLE =
  'bg-nv-smoke/50 text-nv-fog border-nv-smoke'

export default function StatusBadge({ status }: StatusBadgeProps) {
  const normalized = status.toLowerCase().trim()
  const style = STATUS_STYLES[normalized] ?? DEFAULT_STYLE

  return (
    <span
      className={`inline-flex items-center font-bebas text-xs px-2.5 py-1 tracking-wider border rounded-sm ${style}`}
    >
      {status.toUpperCase()}
    </span>
  )
}
