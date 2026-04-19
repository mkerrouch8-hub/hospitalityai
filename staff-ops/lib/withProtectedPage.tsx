import { useRouter } from 'next/router'
import { ReactNode, useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth'

export function withProtectedPage<P extends object>(
  Component: React.ComponentType<P>
) {
  return function ProtectedComponent(props: P) {
    const router = useRouter()
    const { user, loading } = useAuth()
    const [isAuthorized, setIsAuthorized] = useState(false)

    useEffect(() => {
      if (!loading && !user) {
        router.push('/login')
      } else if (!loading && user) {
        setIsAuthorized(true)
      }
    }, [user, loading, router])

    if (loading || !isAuthorized) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-amber-400 mb-4">Loading...</h1>
            <div className="animate-spin h-8 w-8 border-4 border-amber-400 border-t-transparent rounded-full mx-auto"></div>
          </div>
        </div>
      )
    }

    return <Component {...props} />
  }
}
