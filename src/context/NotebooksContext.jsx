import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { generateContent } from '../lib/dummyAI.js'
import { extractText, detectLangFromText } from '../lib/extractText.js'

const NotebooksContext = createContext(null)
const STORAGE_KEY = 'studyrush.notebooks.v2'

function joinSourceText(sources) {
  return sources.map((s) => s.text || '').filter(Boolean).join('\n\n')
}

export function NotebooksProvider({ children }) {
  const [notebooks, setNotebooks] = useState([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setNotebooks(JSON.parse(raw))
    } catch {}
  }, [])

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(notebooks)) } catch {}
  }, [notebooks])

  const createNotebook = useCallback((input) => {
    const id = `nb-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
    const sourceText = joinSourceText(input.sources)
    const content = generateContent({
      title: input.title,
      language: input.language,
      questionCount: input.questionCount,
      nonce: 0,
      sourceText,
    })
    const nb = {
      id,
      title: input.title,
      category: input.category,
      language: input.language,
      questionCount: input.questionCount,
      includeSummary: input.includeSummary,
      includeQuiz: input.includeQuiz,
      sources: input.sources,
      content,
      regenCount: 0,
      createdAt: Date.now(),
    }
    setNotebooks((prev) => [nb, ...prev])
    return nb
  }, [])

  const removeNotebook = useCallback((id) => {
    setNotebooks((prev) => prev.filter((nb) => nb.id !== id))
  }, [])

  const getNotebook = useCallback((id) => notebooks.find((nb) => nb.id === id), [notebooks])

  return (
    <NotebooksContext.Provider value={{ notebooks, createNotebook, removeNotebook, getNotebook }}>
      {children}
    </NotebooksContext.Provider>
  )
}

export function useNotebooks() {
  const ctx = useContext(NotebooksContext)
  if (!ctx) throw new Error('useNotebooks must be used within NotebooksProvider')
  return ctx
}

export function fileKindFromName(name) {
  const lower = name.toLowerCase()
  if (lower.endsWith('.pdf')) return 'pdf'
  if (lower.endsWith('.docx') || lower.endsWith('.doc')) return 'docx'
  if (lower.endsWith('.pptx') || lower.endsWith('.ppt')) return 'pptx'
  if (lower.endsWith('.txt') || lower.endsWith('.md')) return 'txt'
  return 'other'
}

export { extractText, detectLangFromText }
