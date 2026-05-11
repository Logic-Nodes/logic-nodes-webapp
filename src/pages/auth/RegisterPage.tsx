import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Eye, EyeOff, MapPin, ArrowRight } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'

type Role = 'ADMIN' | 'OPERATOR' | 'DRIVER'

interface RegisterFormValues {
  firstName: string
  lastName: string
  email: string
  password: string
  role: Role
}

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: 'ADMIN', label: 'Administrador' },
  { value: 'OPERATOR', label: 'Operador' },
  { value: 'DRIVER', label: 'Conductor' },
]

const inputClass =
  'w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-colors'

const labelClass = 'text-sm font-medium text-slate-300'

export function RegisterPage() {
  const navigate = useNavigate()
  const { signUp, loading } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    defaultValues: { firstName: '', lastName: '', email: '', password: '', role: 'OPERATOR' },
  })

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      await signUp(data.email, data.password, { firstName: data.firstName, lastName: data.lastName }, [data.role])
      toast.success('¡Cuenta creada! Inicia sesión.')
      navigate('/login')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create account'
      toast.error(message)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0F172A 0%, #0F1E3A 50%, #0F172A 100%)' }}
    >
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#2563EB] rounded-full opacity-10 blur-3xl" />
        <div className="absolute -bottom-40 -left-20 w-[500px] h-[500px] bg-[#2563EB] rounded-full opacity-[0.07] blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-2xl bg-[#2563EB] flex items-center justify-center mb-4 shadow-lg shadow-[#2563EB]/30">
            <MapPin size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">OmniTrack</h1>
          <p className="text-sm text-slate-400 mt-1">Fleet Intelligence Platform</p>
        </div>

        {/* Card */}
        <div className="bg-white/[0.05] backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-1">Crear cuenta</h2>
          <p className="text-sm text-slate-400 mb-6">Únete a OmniTrack y gestiona tu flota</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className={labelClass}>Nombre</label>
                <input
                  autoComplete="given-name"
                  placeholder="Ana"
                  className={inputClass}
                  {...register('firstName', { required: 'Requerido' })}
                />
                {errors.firstName && <p className="text-xs text-red-400">{errors.firstName.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Apellido</label>
                <input
                  autoComplete="family-name"
                  placeholder="García"
                  className={inputClass}
                  {...register('lastName', { required: 'Requerido' })}
                />
                {errors.lastName && <p className="text-xs text-red-400">{errors.lastName.message}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className={labelClass}>Correo electrónico</label>
              <input
                type="email"
                autoComplete="email"
                placeholder="tu@empresa.com"
                className={inputClass}
                {...register('email', {
                  required: 'Email requerido',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email inválido' },
                })}
              />
              {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className={labelClass}>Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className={inputClass + ' pr-10'}
                  {...register('password', {
                    required: 'Contraseña requerida',
                    minLength: { value: 6, message: 'Mínimo 6 caracteres' },
                  })}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className={labelClass}>Rol</label>
              <select
                className={inputClass + ' appearance-none'}
                style={{ colorScheme: 'dark' }}
                {...register('role', { required: 'Rol requerido' })}
              >
                {ROLE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value} className="bg-slate-800 text-white">
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors.role && <p className="text-xs text-red-400">{errors.role.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold py-2.5 text-sm transition-colors disabled:opacity-50 disabled:pointer-events-none mt-2"
            >
              {loading ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : (
                <>Crear cuenta <ArrowRight size={15} /></>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-[#2563EB] hover:text-[#93C5FD] font-medium transition-colors">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
