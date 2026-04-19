import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/lib/auth'

export default function Home() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/dashboard')
      } else {
        router.push('/login')
      }
    }
  }, [user, loading, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-amber-400 mb-2">✦ LUXE OPS</h1>
        <p className="text-slate-400">Staff Operations Platform</p>
        <p className="text-slate-500 mt-4">Redirecting...</p>
      </div>
    </div>
  )
}
