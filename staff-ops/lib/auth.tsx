import { createContext, useContext, useEffect, useState } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from './supabase'

interface Hotel {
  id: string
  name: string
  email: string
  phone: string
  city: string
  role: 'manager' | 'staff' | 'viewer'
  created_at: string
}

interface AuthContextType {
  user: User | null
  session: Session | null
  hotel: Hotel | null
  loading: boolean
  signUp: (email: string, password: string, hotelData: Partial<Hotel>) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  switchHotel: (hotelId: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [hotel, setHotel] = useState<Hotel | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
        setUser(session?.user || null)

        if (session?.user) {
          // Fetch user's hotel(s) - get the first one or the stored active one
          const { data: hotels } = await supabase
            .from('hotels')
            .select('*')
            .eq('user_id', session.user.id)
            .limit(1)

          if (hotels && hotels.length > 0) {
            setHotel(hotels[0])
          }
        }
      } catch (error) {
        console.error('Auth init error:', error)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user || null)
      }
    )

    return () => subscription?.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, hotelData: Partial<Hotel>) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) throw authError

      if (authData.user) {
        // Create hotel record
        const { data: hotelRecord, error: hotelError } = await supabase
          .from('hotels')
          .insert([
            {
              user_id: authData.user.id,
              name: hotelData.name || 'My Hotel',
              email: hotelData.email || email,
              phone: hotelData.phone,
              city: hotelData.city,
              role: 'manager',
            },
          ])
          .select()
          .single()

        if (hotelError) throw hotelError

        setHotel(hotelRecord)
      }
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setSession(null)
      setHotel(null)
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  const switchHotel = async (hotelId: string) => {
    try {
      const { data, error } = await supabase
        .from('hotels')
        .select('*')
        .eq('id', hotelId)
        .single()

      if (error) throw error
      setHotel(data)
    } catch (error) {
      console.error('Switch hotel error:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, session, hotel, loading, signUp, signIn, signOut, switchHotel }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export function useHotel() {
  const { hotel } = useAuth()
  if (!hotel) {
    throw new Error('No hotel context - user must be authenticated')
  }
  return hotel
}
