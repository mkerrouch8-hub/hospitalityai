import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { useRouter } from 'next/router'

export default function LoginPage() {
  const router = useRouter()
  const { signIn, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await signIn(email, password)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Failed to sign in')
    } finally {
      setIsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-800 rounded-lg shadow-2xl p-8 border border-slate-700">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-amber-400 tracking-widest">✦ LUXE OPS</h1>
            <p className="text-slate-400 text-sm mt-2">Staff Operations Platform</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-900/30 border border-red-700 rounded text-red-200 text-sm">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition"
                placeholder="manager@hotel.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full px-4 py-3 bg-amber-400 text-slate-900 font-semibold rounded-lg hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed transition uppercase text-sm tracking-wide"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-600"></div>
            <span className="text-xs text-slate-400 uppercase">or</span>
            <div className="flex-1 h-px bg-slate-600"></div>
          </div>

          {/* Sign Up Link */}
          <Link
            href="/register"
            className="block w-full px-4 py-3 border border-amber-400 text-amber-400 font-semibold rounded-lg hover:bg-amber-400/10 transition uppercase text-sm tracking-wide text-center"
          >
            Create New Account
          </Link>

          {/* Footer */}
          <p className="text-center text-xs text-slate-400 mt-6">
            Need help? Contact{' '}
            <a href="mailto:kerrouch@luxeops.it.com" className="text-amber-400 hover:underline">
              support@luxeops.it.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
