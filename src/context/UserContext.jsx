import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'

const DEFAULT_USER = {
  name: '',
  email: '',
  plan: 'Free plan',
  streak: 0,
  xp: 0,
  weeklyXP: 0,
  weeklyGoal: 1000,
}

const UserContext = createContext(null)

export function UserProvider({ children }) {
  const [user, setUser] = useState(DEFAULT_USER)
  const [loading, setLoading] = useState(true)

  // Fetch profile from DB and merge with auth user
  async function fetchAndSetUser(authUser) {
    if (!authUser) {
      setUser(DEFAULT_USER)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', authUser.id)
      .single()

    setUser({
      name: profile?.name || authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || '',
      email: authUser.email || '',
      plan: profile?.plan || 'Free plan',
      streak: profile?.streak || 0,
      xp: profile?.xp || 0,
      weeklyXP: profile?.weekly_xp || 0,
      weeklyGoal: profile?.weekly_goal || 1000,
    })
  }

  useEffect(() => {
    let isMounted = true

    async function init() {
      try {
        const { data } = await supabase.auth.getSession()
        if (isMounted) {
          await fetchAndSetUser(data?.session?.user || null)
        }
      } catch (err) {
        console.error('Session init error:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    init()

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (isMounted) {
        await fetchAndSetUser(session?.user || null)
      }
    })

    return () => {
      isMounted = false
      listener?.subscription?.unsubscribe?.()
    }
  }, [])

  // Called after successful login/register from the pages
  const login = (userData) => {
    setUser((prev) => ({ ...prev, ...userData }))
  }

  // Called on logout
  const logout = () => {
    setUser(DEFAULT_USER)
  }

  // Kept for backwards compatibility
  const signIn = async ({ email, password }) => {
    const res = await supabase.auth.signInWithPassword({ email, password })
    if (res.error) throw res.error
    await fetchAndSetUser(res.data?.user)
    return res
  }

  const signUp = async ({ email, password, options } = {}) => {
    const res = await supabase.auth.signUp({ email, password, options })
    if (res.error) throw res.error
    await fetchAndSetUser(res.data?.user)
    return res
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(DEFAULT_USER)
  }

  return (
    <UserContext.Provider value={{ user, loading, login, logout, signIn, signUp, signOut }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser must be used within UserProvider')
  return ctx
}
