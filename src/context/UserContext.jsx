import { createContext, useContext, useEffect, useState } from 'react'
import supabase from '../lib/supabase'

const DEFAULT_USER = {
  name: '',
  email: '',
  plan: 'Free plan',
  streak: 12,
  xp: 2450,
  weeklyXP: 650,
  weeklyGoal: 1000,
}

const UserContext = createContext(null)

export function UserProvider({ children }) {
  const [user, setUser] = useState(DEFAULT_USER)
  const [loading, setLoading] = useState(true)

  // Map Supabase user object to our UI user shape
  const mapUser = (u) => {
    if (!u) return DEFAULT_USER
    const email = u.email || ''
    const name = u.user_metadata?.full_name || u.user_metadata?.name || (email ? email.split('@')[0] : '')
    return { ...DEFAULT_USER, name, email }
  }

  useEffect(() => {
    let isMounted = true

    async function init() {
      try {
        const { data } = await supabase.auth.getSession()
        const session = data?.session
        if (isMounted) {
          setUser(mapUser(session?.user))
        }
      } catch (err) {
        // ignore
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    init()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) setUser(mapUser(session?.user))
    })

    return () => {
      isMounted = false
      listener?.subscription?.unsubscribe?.()
    }
  }, [])

  const signIn = async ({ email, password }) => {
    const res = await supabase.auth.signInWithPassword({ email, password })
    if (res.error) throw res.error
    setUser(mapUser(res.data?.user))
    return res
  }

  const signUp = async ({ email, password, options } = {}) => {
    const res = await supabase.auth.signUp({ email, password, options })
    if (res.error) throw res.error
    setUser(mapUser(res.data?.user))
    return res
  }

  const signInWithGoogle = async () => {
    const res = await supabase.auth.signInWithOAuth({ provider: 'google' })
    if (res.error) throw res.error
    return res
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(DEFAULT_USER)
  }

  return (
    <UserContext.Provider value={{ user, loading, signIn, signUp, signInWithGoogle, signOut }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser must be used within UserProvider')
  return ctx
}
