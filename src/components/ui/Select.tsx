import { type SelectHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/utils/cn'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: { value: string | number; label: string }[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-slate-300">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          className={cn(
            'w-full rounded-xl border border-white/10 bg-slate-900 px-3.5 py-2.5 text-sm text-white appearance-none',
            'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        >
          {placeholder && <option value="" style={{ backgroundColor: '#0f172a', color: '#fff' }}>{placeholder}</option>}
          {options.map(opt => (
            <option key={opt.value} value={opt.value} style={{ backgroundColor: '#0f172a', color: '#fff' }}>{opt.label}</option>
          ))}
        </select>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    )
  }
)
Select.displayName = 'Select'
