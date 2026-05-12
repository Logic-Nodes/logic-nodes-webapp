import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Eye, EyeOff, MapPin, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuthStore } from '@/store/auth.store'

interface LoginFormValues {
  email: string
  password: string
  rememberMe: boolean
}

export function LoginPage() {
  const navigate = useNavigate()
  const { signIn, loading } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    defaultValues: { email: '', password: '', rememberMe: false },
  })

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await signIn(data.email, data.password)
      navigate('/dashboard')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to sign in'
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
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#2563EB] rounded-full opacity-10 blur-3xl" />
        <div className="absolute -bottom-40 -right-20 w-[500px] h-[500px] bg-[#2563EB] rounded-full opacity-[0.07] blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500 rounded-full opacity-[0.03] blur-3xl" />
        {/* Grid pattern */}
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
          <div className="h-12 w-12 rounded-2xl bg-[#2563EB] flex items-center justify-center mb-4 shadow-lg shadow-[#2563EB]/40">
            <MapPin size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">OmniTrack</h1>
          <p className="text-sm text-slate-400 mt-1">Fleet Intelligence Platform</p>
        </div>

        {/* Card */}
        <div className="bg-white/[0.05] backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-1">Bienvenido de vuelta</h2>
          <p className="text-sm text-slate-400 mb-6">Ingresa tus credenciales para continuar</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Correo electrónico</label>
              <input
                type="email"
                autoComplete="email"
                placeholder="tu@empresa.com"
                className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-sm text-white placeholder-slate-500
                  focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-colors"
                {...register('email', {
                  required: 'Email requerido',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email inválido' },
                })}
              />
              {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 pr-10 text-sm text-white placeholder-slate-500
                    focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-colors"
                  {...register('password', {
                    required: 'Contraseña requerida',
                    minLength: { value: 4, message: 'Mínimo 4 caracteres' },
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

            <div className="flex items-center gap-2">
              <input
                id="rememberMe"
                type="checkbox"
                className="h-4 w-4 rounded border-slate-600 bg-white/5 accent-[#2563EB]"
                {...register('rememberMe')}
              />
              <label htmlFor="rememberMe" className="text-sm text-slate-400 select-none">
                Recordarme
              </label>
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
                <>Iniciar sesión <ArrowRight size={15} /></>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-[#2563EB] hover:text-[#93C5FD] font-medium transition-colors">
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  )
}
