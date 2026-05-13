import { createContext, useContext, useState } from 'react'

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
  const login = (data) => setUser({ ...DEFAULT_USER, ...data })
  const register = (data) => setUser({ ...DEFAULT_USER, ...data, streak: 0, xp: 0, weeklyXP: 0 })
  const logout = () => setUser(DEFAULT_USER)
  return (
    <UserContext.Provider value={{ user, login, register, logout }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser must be used within UserProvider')
  return ctx
}
