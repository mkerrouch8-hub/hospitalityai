import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from './supabase'

interface Hotel {
  id: string
  name: string
  city: string
  subscription_plan: string
}

interface AuthContextType {
  user: User | null
  session: Session | null
  hotel: Hotel | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, hotelName: string, city: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [hotel, setHotel] = useState<Hotel | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) loadHotel(session.user.id)
      else setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) loadHotel(session.user.id)
      else {
        setHotel(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadHotel = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('hotels')
        .select('*')
        .eq('user_id', userId)
        .single()
      setHotel(data)
    } catch (err) {
      setHotel(null)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signUp = async (email: string, password: string, hotelName: string, city: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error || !data.user) return { error }

    // Create hotel record
    const { error: hotelError } = await supabase.from('hotels').insert([{
      user_id: data.user.id,
      name: hotelName,
      city: city,
      email: email,
    }])

    return { error: hotelError }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setHotel(null)
  }

  return (
    <AuthContext.Provider value={{ user, session, hotel, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

export function useHotel() {
  const { hotel } = useAuth()
  return hotel
}
