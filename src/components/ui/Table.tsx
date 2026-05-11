import { type ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface Column<T> {
  key: string
  header: string
  render?: (row: T) => ReactNode
  className?: string
}

interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  emptyMessage?: string
  onRowClick?: (row: T) => void
}

export function Table<T extends Record<string, unknown>>({
  columns,
  data,
  loading,
  emptyMessage = 'No data available',
  onRowClick,
}: TableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/[0.03]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10">
            <th className="px-4 py-3 text-left w-8">
              <div className="h-4 w-4 rounded border border-white/20" />
            </th>
            {columns.map(col => (
              <th
                key={col.key}
                className={cn(
                  'px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wide',
                  col.className
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.06]">
          {loading ? (
            <tr>
              <td colSpan={columns.length + 1} className="px-4 py-12 text-center text-slate-500">
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-brand-500" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Cargando...
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} className="px-4 py-12 text-center text-slate-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={i}
                onClick={() => onRowClick?.(row)}
                className={cn('transition-colors hover:bg-white/[0.04]', onRowClick && 'cursor-pointer')}
              >
                <td className="px-4 py-3">
                  <div className="h-4 w-4 rounded border border-white/20" />
                </td>
                {columns.map(col => (
                  <td key={col.key} className={cn('px-4 py-3 text-slate-200', col.className)}>
                    {col.render ? col.render(row) : String(row[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
