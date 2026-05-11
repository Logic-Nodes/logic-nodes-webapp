import { type ReactNode, useEffect } from 'react'
import { X } from 'lucide-react'

interface SlideOverProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  footer?: ReactNode
  size?: 'md' | 'lg'
}

export function SlideOver({ open, onClose, title, children, footer, size = 'md' }: SlideOverProps) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  const panelWidth = size === 'lg' ? 'w-[640px]' : 'w-[480px]'

  return (
    <div className={`fixed inset-0 z-40 ${open ? '' : 'pointer-events-none'}`}>
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`absolute right-0 top-0 h-full z-50 bg-[#1E293B] border-l border-white/10 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${panelWidth} ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-white/5"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-white/10 bg-[#1E293B] shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
