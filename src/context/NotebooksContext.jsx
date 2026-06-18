import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { generateContent } from '../lib/groqAI.js'
import { extractText, detectLangFromText } from '../lib/extractText.js'
import { supabase } from '../lib/supabase.js'
import { useUser } from './UserContext.jsx'

const NotebooksContext = createContext(null)

function joinSourceText(sources) {
  return sources.map((s) => s.text || '').filter(Boolean).join('\n\n')
}

export function NotebooksProvider({ children }) {
  const [notebooks, setNotebooks] = useState([])
  const [loading, setLoading] = useState(false)
  const { user } = useUser()

  // Load notebooks from Supabase when user logs in
  useEffect(() => {
    if (!user?.email) {
      setNotebooks([])
      return
    }

    async function fetchNotebooks() {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('notebooks')
          .select(`*, notebook_sources (*), quiz_questions (*)`)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching notebooks:', error)
          return
        }

        const mapped = (data || []).map((nb) => ({
          id: nb.id,
          title: nb.title,
          category: nb.category,
          language: nb.language,
          questionCount: nb.question_count,
          includeSummary: nb.include_summary,
          includeQuiz: nb.include_quiz,
          regenCount: nb.regen_count,
          createdAt: new Date(nb.created_at).getTime(),
          sources: (nb.notebook_sources || []).map((s) => ({
            fileName: s.file_name,
            kind: s.file_kind,
            size: s.file_size,
            addedAt: new Date(s.added_at).getTime(),
            text: s.text_content || '',
          })),
          content: {
            summary: nb.summary || '',
            questions: (nb.quiz_questions || []).map((q) => ({
              id: q.id,
              topic: q.topic,
              text: q.text,
              options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
              correctId: q.correct_id,
              explanation: q.explanation,
            })),
            generatedAt: new Date(nb.created_at).getTime(),
          },
        }))

        setNotebooks(mapped)
      } finally {
        setLoading(false)
      }
    }

    fetchNotebooks()
  }, [user?.email])

  const createNotebook = useCallback(async (input) => {
    // Get current session to get user_id
    const { data: sessionData } = await supabase.auth.getSession()
    const userId = sessionData?.session?.user?.id

    if (!userId) {
      throw new Error('User not authenticated')
    }

    // 1. Generate content with AI
    const sourceText = joinSourceText(input.sources)
    const content = await generateContent({
      title: input.title,
      language: input.language,
      questionCount: input.questionCount,
      nonce: 0,
      sourceText,
    })

    // small sanitizer to remove NUL chars which Postgres rejects
    const sanitize = (v) => {
      if (v == null) return v
      try {
        return String(v).replace(/\u0000/g, '')
      } catch (e) {
        return v
      }
    }

    // 2. Insert notebook row — include user_id!
    const { data: nbData, error: nbError } = await supabase
      .from('notebooks')
      .insert({
        user_id: userId,
        title: sanitize(input.title),
        category: sanitize(input.category),
        language: sanitize(input.language),
        question_count: input.questionCount,
        include_summary: input.includeSummary,
        include_quiz: input.includeQuiz,
        regen_count: 0,
        summary: sanitize(content.summary || ''),
      })
      .select()
      .single()

    if (nbError) {
      console.error('Error creating notebook:', nbError)
      throw nbError
    }

    const notebookId = nbData.id

    // 3. Insert sources
    if (input.sources && input.sources.length > 0) {
      const sourcesPayload = input.sources.map((s) => ({
        notebook_id: notebookId,
        file_name: sanitize(s.fileName),
        file_kind: sanitize(s.kind),
        file_size: s.size || 0,
        text_content: sanitize(s.text || ''),
      }))
      // try normal insert first
      let { error: srcError } = await supabase.from('notebook_sources').insert(sourcesPayload)
      if (srcError) {
        console.error('Error inserting sources (first attempt):', srcError)
        // If the DB expects a bytea column and rejects text, retry encoding text_content as bytea hex
        const isByteaError = (srcError.code === '22P02') || (srcError.message && /bytea/i.test(srcError.message))
        if (isByteaError) {
          try {
            const encodeToByteaHex = (str) => {
              if (str == null) return null
              const encoder = new TextEncoder()
              const bytes = encoder.encode(String(str))
              let hex = ''
              for (let b of bytes) hex += b.toString(16).padStart(2, '0')
              return `\\x${hex}`
            }
            const sourcesPayloadHex = sourcesPayload.map((s) => ({
              ...s,
              text_content: encodeToByteaHex(s.text_content),
            }))
            const retry = await supabase.from('notebook_sources').insert(sourcesPayloadHex)
            if (retry.error) {
              console.error('Retry inserting sources (as bytea hex) failed:', retry.error)
            } else {
              srcError = null
            }
          } catch (e) {
            console.error('Error while retrying insert as bytea hex:', e)
          }
        }
      }
      if (srcError) console.error('Error inserting sources:', srcError)
    }

    // 4. Insert questions
    if (content.questions && content.questions.length > 0) {
      const questionsPayload = content.questions.map((q) => ({
        notebook_id: notebookId,
        topic: sanitize(q.topic),
        text: sanitize(q.text),
        // store options as JSON string (DB expects text/json string)
        options: typeof q.options === 'string' ? sanitize(q.options) : sanitize(JSON.stringify(q.options)),
        correct_id: q.correctId,
        explanation: sanitize(q.explanation),
      }))
      const { error: qError } = await supabase
        .from('quiz_questions')
        .insert(questionsPayload)
      if (qError) console.error('Error inserting questions:', qError)
    }

    // 5. Build local notebook object and update state
    const nb = {
      id: notebookId,
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

  const regenerateQuestions = useCallback(async (id, count) => {
    const nb = notebooks.find((n) => n.id === id)
    if (!nb) throw new Error('Notebook not found')

    const sanitize = (v) => {
      if (v == null) return v
      try { return String(v).replace(/\u0000/g, '') } catch { return v }
    }

    const sourceText = joinSourceText(nb.sources)
    const excludeTopics = nb.content.questions.map((q) => q.topic).filter(Boolean).join(', ')
    const newRegenCount = (nb.regenCount || 0) + 1

    const content = await generateContent({
      title: nb.title,
      language: nb.language,
      questionCount: count,
      sourceText,
      excludeTopics,
      nonce: newRegenCount,
    })

    // Insert new questions
    if (content.questions.length > 0) {
      const payload = content.questions.map((q) => ({
        notebook_id: id,
        topic: sanitize(q.topic),
        text: sanitize(q.text),
        options: sanitize(JSON.stringify(q.options)),
        correct_id: q.correctId,
        explanation: sanitize(q.explanation),
      }))
      const { error } = await supabase.from('quiz_questions').insert(payload)
      if (error) { console.error('Error inserting regen questions:', error); throw error }
    }

    // Update regen_count and question_count in Supabase
    const newTotal = nb.content.questions.length + content.questions.length
    await supabase.from('notebooks').update({ regen_count: newRegenCount, question_count: newTotal }).eq('id', id)

    // Update local state
    setNotebooks((prev) => prev.map((n) => {
      if (n.id !== id) return n
      return {
        ...n,
        questionCount: newTotal,
        regenCount: newRegenCount,
        content: {
          ...n.content,
          questions: [...n.content.questions, ...content.questions],
        },
      }
    }))

    return content.questions.length
  }, [notebooks])

  const removeNotebook = useCallback(async (id) => {
    const { error } = await supabase
      .from('notebooks')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting notebook:', error)
      return
    }

    setNotebooks((prev) => prev.filter((nb) => nb.id !== id))
  }, [])

  const getNotebook = useCallback((id) => notebooks.find((nb) => nb.id === id), [notebooks])

  const addMaterial = useCallback(async (id, newSources) => {
    const nb = notebooks.find((n) => n.id === id)
    if (!nb) throw new Error('Notebook not found')

    const sanitize = (v) => {
      if (v == null) return v
      try { return String(v).replace(/\u0000/g, '') } catch { return v }
    }

    // Save new sources to DB
    const sourcesPayload = newSources.map((s) => ({
      notebook_id: id,
      file_name: sanitize(s.fileName),
      file_kind: sanitize(s.kind),
      file_size: s.size || 0,
      text_content: sanitize(s.text || ''),
    }))
    const { error: srcError } = await supabase.from('notebook_sources').insert(sourcesPayload)
    if (srcError) throw srcError

    // Regenerate summary from all sources combined
    const allSources = [...nb.sources, ...newSources]
    const sourceText = joinSourceText(allSources)
    const content = await generateContent({
      title: nb.title,
      language: nb.language,
      questionCount: 1,
      sourceText,
    })

    // Update summary in DB
    const { error: updateError } = await supabase
      .from('notebooks')
      .update({ summary: sanitize(content.summary) })
      .eq('id', id)
    if (updateError) throw updateError

    // Update local state
    setNotebooks((prev) => prev.map((n) => {
      if (n.id !== id) return n
      return {
        ...n,
        sources: [...n.sources, ...newSources],
        content: { ...n.content, summary: content.summary },
      }
    }))
  }, [notebooks])

  const removeSource = useCallback(async (notebookId, fileName) => {
    const nb = notebooks.find((n) => n.id === notebookId)
    if (!nb) throw new Error('Notebook not found')

    const sanitize = (v) => {
      if (v == null) return v
      try { return String(v).replace(/\u0000/g, '') } catch { return v }
    }

    const { error: delError } = await supabase
      .from('notebook_sources')
      .delete()
      .eq('notebook_id', notebookId)
      .eq('file_name', fileName)
    if (delError) throw delError

    const remaining = nb.sources.filter((s) => s.fileName !== fileName)

    let newSummary = ''
    if (nb.includeSummary && remaining.length > 0) {
      const sourceText = joinSourceText(remaining)
      const content = await generateContent({
        title: nb.title,
        language: nb.language,
        questionCount: 1,
        sourceText,
      })
      newSummary = sanitize(content.summary)
    }

    await supabase.from('notebooks').update({ summary: newSummary }).eq('id', notebookId)

    setNotebooks((prev) => prev.map((n) => {
      if (n.id !== notebookId) return n
      return { ...n, sources: remaining, content: { ...n.content, summary: newSummary } }
    }))
  }, [notebooks])

  return (
    <NotebooksContext.Provider value={{ notebooks, loading, createNotebook, removeNotebook, getNotebook, regenerateQuestions, addMaterial, removeSource }}>
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
