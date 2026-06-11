import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'
import { generateContent } from '../src/lib/dummyAI.js'

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env')
  const env = {}
  if (!fs.existsSync(envPath)) return env
  const raw = fs.readFileSync(envPath, 'utf8')
  raw.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) return
    const idx = trimmed.indexOf('=')
    if (idx === -1) return
    const k = trimmed.substring(0, idx)
    let v = trimmed.substring(idx + 1)
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1)
    env[k] = v
  })
  return env
}

function sanitize(v) {
  if (v == null) return v
  return String(v).replace(/\u0000/g, '')
}

function encodeToByteaHex(str) {
  if (str == null) return null
  const encoder = new TextEncoder()
  const bytes = encoder.encode(String(str))
  let hex = ''
  for (let b of bytes) hex += b.toString(16).padStart(2, '0')
  return `\\x${hex}`
}

async function run() {
  const env = loadEnv()
  const url = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const key = env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) {
    console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env')
    process.exit(2)
  }

  const supabase = createClient(url, key)

  // pick a user_id from profiles to attach to the notebook
  const { data: profiles, error: pErr } = await supabase.from('profiles').select('user_id').limit(1)
  if (pErr) {
    console.error('Failed to fetch profiles:', pErr)
    process.exit(1)
  }
  if (!profiles || profiles.length === 0) {
    console.error('No profiles found to attach notebook to. Aborting.')
    process.exit(1)
  }
  const userId = profiles[0].user_id
  console.log('Using user_id:', userId)

  const input = {
    title: 'Automated test notebook',
    category: 'Test',
    language: 'he',
    questionCount: 3,
    includeSummary: true,
    includeQuiz: true,
    sources: [
      { fileName: 'test.txt', kind: 'txt', size: 42, text: 'תוכן בדיקה פשוט' },
    ],
  }

  const sourceText = input.sources.map((s) => s.text || '').join('\n\n')
  const content = generateContent({ title: input.title, language: input.language, questionCount: input.questionCount, sourceText })

  // insert notebook
  const nbRow = {
    user_id: userId,
    title: sanitize(input.title),
    category: sanitize(input.category),
    language: sanitize(input.language),
    question_count: input.questionCount,
    include_summary: input.includeSummary,
    include_quiz: input.includeQuiz,
    regen_count: 0,
    summary: sanitize(content.summary || ''),
  }

  console.log('Inserting notebook row...')
  const { data: nbData, error: nbErr } = await supabase.from('notebooks').insert(nbRow).select().single()
  if (nbErr) {
    console.error('Notebook insert error:', nbErr)
    process.exit(1)
  }
  console.log('Notebook inserted id:', nbData.id)

  const notebookId = nbData.id

  // insert sources (with retry to handle bytea)
  const sourcesPayload = input.sources.map((s) => ({
    notebook_id: notebookId,
    file_name: sanitize(s.fileName),
    file_kind: sanitize(s.kind),
    file_size: s.size || 0,
    text_content: sanitize(s.text || ''),
  }))

  console.log('Inserting sources (attempt 1)...')
  let { error: srcError } = await supabase.from('notebook_sources').insert(sourcesPayload)
  if (srcError) {
    console.error('Sources insert error (1):', srcError)
    const isByteaError = (srcError.code === '22P02') || (srcError.message && /bytea/i.test(srcError.message))
    if (isByteaError) {
      console.log('Detected bytea error — retrying insert with bytea hex encoding')
      const sourcesHex = sourcesPayload.map((s) => ({ ...s, text_content: encodeToByteaHex(s.text_content) }))
      const retry = await supabase.from('notebook_sources').insert(sourcesHex)
      if (retry.error) {
        console.error('Sources insert retry error:', retry.error)
        process.exit(1)
      } else {
        console.log('Sources inserted with bytea hex encoding')
      }
    } else {
      process.exit(1)
    }
  } else {
    console.log('Sources inserted successfully')
  }

  // insert questions
  if (content.questions && content.questions.length > 0) {
    const questionsPayload = content.questions.map((q) => ({
      notebook_id: notebookId,
      topic: sanitize(q.topic),
      text: sanitize(q.text),
      options: typeof q.options === 'string' ? sanitize(q.options) : sanitize(JSON.stringify(q.options)),
      correct_id: q.correctId,
      explanation: sanitize(q.explanation),
    }))
    console.log('Inserting questions...')
    const { error: qErr } = await supabase.from('quiz_questions').insert(questionsPayload)
    if (qErr) {
      console.error('Questions insert error:', qErr)
      process.exit(1)
    }
    console.log('Questions inserted')
  }

  console.log('Test notebook creation complete — inserted id:', notebookId)
}

run().catch((e) => { console.error('Test insert failed:', e); process.exit(1) })
