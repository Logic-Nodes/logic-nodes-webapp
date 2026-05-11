import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/auth.store'
import { profileApi } from '@/api/profile.api'
import type { Profile, UpdateProfileDto } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'

interface FormValues {
  firstName: string
  lastName: string
  phoneNumber: string
  documentType: string
  document: string
  birthDate: string
}

export function ProfilePage() {
  const user = useAuthStore(s => s.user)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [saving, setSaving] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>()

  useEffect(() => {
    if (!user) return
    setLoadingProfile(true)
    profileApi
      .getByUserId(user.id)
      .then(p => {
        setProfile(p)
        reset({
          firstName: p.firstName ?? '',
          lastName: p.lastName ?? '',
          phoneNumber: p.phoneNumber ?? '',
          documentType: p.documentType ?? '',
          document: p.document ?? '',
          birthDate: p.birthDate ?? '',
        })
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoadingProfile(false))
  }, [user, reset])

  const onSubmit = async (data: FormValues) => {
    if (!user || !profile) return
    setSaving(true)
    try {
      const dto: UpdateProfileDto = {
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber || null,
        documentType: data.documentType || null,
        document: data.document || null,
        birthDate: data.birthDate || null,
      }
      const updated = await profileApi.update(profile.id, dto)
      setProfile(updated)
      toast.success('Profile updated successfully')
    } catch {
      toast.error('Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  if (!user) return null

  const initials = user.email.charAt(0).toUpperCase()

  return (
    <div className="p-6 max-w-5xl">
      <h1 className="text-2xl font-bold text-white mb-6">My Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Account Info */}
        <Card>
          <CardContent className="py-8 flex flex-col items-center text-center gap-4">
            <div className="h-20 w-20 rounded-full bg-[#2563EB] flex items-center justify-center text-white text-3xl font-bold">
              {initials}
            </div>
            <div>
              <p className="font-semibold text-white">{user.email}</p>
              <div className="flex flex-wrap gap-1.5 justify-center mt-2">
                {user.roles.map(role => (
                  <Badge key={role} variant="brand">{role}</Badge>
                ))}
              </div>
            </div>
            <button className="text-sm text-[#2563EB] hover:underline font-medium">
              Cambiar contraseña
            </button>
          </CardContent>
        </Card>

        {/* Right: Edit Profile */}
        <Card className="md:col-span-2">
          <CardHeader>
            <h2 className="text-base font-semibold text-white">Editar Perfil</h2>
          </CardHeader>
          <CardContent>
            {loadingProfile ? (
              <div className="flex items-center justify-center py-10 text-slate-400 text-sm gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-brand-500"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                Loading…
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    error={errors.firstName?.message}
                    {...register('firstName', { required: 'First name is required' })}
                  />
                  <Input
                    label="Last Name"
                    error={errors.lastName?.message}
                    {...register('lastName', { required: 'Last name is required' })}
                  />
                </div>
                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="+1 555 000 0000"
                  {...register('phoneNumber')}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Document Type"
                    placeholder="e.g. Passport, DNI"
                    {...register('documentType')}
                  />
                  <Input
                    label="Document Number"
                    {...register('document')}
                  />
                </div>
                <Input
                  label="Birth Date"
                  type="date"
                  {...register('birthDate')}
                />
                <div className="pt-2">
                  <Button type="submit" loading={saving}>
                    Guardar cambios
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
