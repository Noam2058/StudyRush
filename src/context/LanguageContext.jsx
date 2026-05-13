import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { translations } from '../i18n/translations.js'

const LanguageContext = createContext(null)
const STORAGE_KEY = 'studyrush.lang'

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState('he')

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored === 'he' || stored === 'en') setLangState(stored)
    } catch {}
  }, [])

  useEffect(() => {
    const dir = lang === 'he' ? 'rtl' : 'ltr'
    document.documentElement.setAttribute('dir', dir)
    document.documentElement.setAttribute('lang', lang)
    try { localStorage.setItem(STORAGE_KEY, lang) } catch {}
  }, [lang])

  const setLang = useCallback((l) => setLangState(l), [])
  const toggle = useCallback(() => setLangState((p) => p === 'he' ? 'en' : 'he'), [])

  const t = useCallback((key, vars) => {
    let str = translations[lang]?.[key] ?? translations.he[key] ?? key
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v))
      }
    }
    return str
  }, [lang])

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggle, t, dir: lang === 'he' ? 'rtl' : 'ltr' }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLang must be used within LanguageProvider')
  return ctx
}
