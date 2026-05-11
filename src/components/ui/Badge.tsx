import { type HTMLAttributes } from 'react'
import { cn } from '@/utils/cn'

type BadgeVariant = 'gray' | 'brand' | 'success' | 'warning' | 'error' | 'blue' | 'amber'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  dot?: boolean
}

const variants: Record<BadgeVariant, string> = {
  gray: 'bg-white/10 text-slate-300',
  brand: 'bg-brand-500/15 text-brand-300',
  success: 'bg-emerald-500/15 text-emerald-400',
  warning: 'bg-amber-500/15 text-amber-400',
  error: 'bg-red-500/15 text-red-400',
  blue: 'bg-blue-500/15 text-blue-400',
  amber: 'bg-amber-500/15 text-amber-400',
}

const dotColors: Record<BadgeVariant, string> = {
  gray: 'bg-slate-500',
  brand: 'bg-brand-600',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  error: 'bg-red-500',
  blue: 'bg-blue-500',
  amber: 'bg-amber-500',
}

export function Badge({ variant = 'gray', dot, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}
      {...props}
    >
      {dot && (
        <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', dotColors[variant])} />
      )}
      {children}
    </span>
  )
}
