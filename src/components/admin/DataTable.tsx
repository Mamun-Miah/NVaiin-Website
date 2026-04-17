'use client'

import { type ReactNode, type LucideIcon, Inbox } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface Column {
  key: string
  label: string
  className?: string
}

interface EmptyState {
  icon?: LucideIcon
  message: string
  action?: ReactNode
}

interface DataTableProps {
  columns: Column[]
  data: any[]
  renderCell: (key: string, row: any) => ReactNode
  emptyState: EmptyState
  loading?: boolean
}

function SkeletonRow({ columns }: { columns: Column[] }) {
  return (
    <tr className="border-b border-nv-smoke/50">
      {columns.map((col) => (
        <td key={col.key} className="px-4 py-3">
          <Skeleton className="h-4 w-3/4 bg-nv-smoke rounded-sm" />
        </td>
      ))}
    </tr>
  )
}

export default function DataTable({
  columns,
  data,
  renderCell,
  emptyState,
  loading = false,
}: DataTableProps) {
  const EmptyIcon = emptyState.icon ?? Inbox

  return (
    <div className="bg-nv-concrete border border-nv-smoke overflow-hidden rounded-sm">
      {/* Scrollable wrapper */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          {/* Header */}
          <thead>
            <tr className="border-b border-nv-smoke">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left font-bebas tracking-wider text-nv-fog text-xs uppercase ${
                    col.className ?? ''
                  }`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {loading ? (
              // Skeleton rows
              Array.from({ length: 5 }).map((_, i) => (
                <SkeletonRow key={i} columns={columns} />
              ))
            ) : data.length === 0 ? (
              // Empty state
              <tr>
                <td colSpan={columns.length} className="px-4 py-16">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-nv-smoke/50 flex items-center justify-center">
                      <EmptyIcon className="h-6 w-6 text-nv-fog" />
                    </div>
                    <p className="font-mono-brand text-sm text-nv-fog">
                      {emptyState.message}
                    </p>
                    {emptyState.action}
                  </div>
                </td>
              </tr>
            ) : (
              // Data rows
              data.map((row, idx) => (
                <tr
                  key={row.id ?? idx}
                  className="border-b border-nv-smoke/50 hover:bg-nv-smoke/30 transition-colors duration-150"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-4 py-3 font-mono-brand text-sm text-nv-white ${
                        col.className ?? ''
                      }`}
                    >
                      {renderCell(col.key, row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
