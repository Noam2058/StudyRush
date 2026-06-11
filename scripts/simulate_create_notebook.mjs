import fs from 'fs'
import path from 'path'
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

async function run() {
  console.log('Simulating createNotebook payload generation...')
  const env = loadEnv()

  // sample input (mimic UI payload)
  const input = {
    title: 'TEST Notebook',
    category: 'General',
    language: 'he',
    questionCount: 4,
    includeSummary: true,
    includeQuiz: true,
    sources: [
      { fileName: 'sample.txt', kind: 'txt', size: 123, text: "זה טקסט לדוגמה\u0000 עם תו נל" },
    ],
  }

  const sourceText = input.sources.map((s) => s.text || '').join('\n\n')
  const content = generateContent({ title: input.title, language: input.language, questionCount: input.questionCount, sourceText })

  // Build notebook row payload
  const nbRow = {
    user_id: 'test-user-id',
    title: sanitize(input.title),
    category: sanitize(input.category),
    language: sanitize(input.language),
    question_count: input.questionCount,
    include_summary: input.includeSummary,
    include_quiz: input.includeQuiz,
    regen_count: 0,
    summary: sanitize(content.summary || ''),
  }

  // sources
  const sourcesPayload = input.sources.map((s) => ({
    notebook_id: 'TBD',
    file_name: sanitize(s.fileName),
    file_kind: sanitize(s.kind),
    file_size: s.size || 0,
    text_content: sanitize(s.text || ''),
  }))

  // questions
  const questionsPayload = content.questions.map((q) => ({
    notebook_id: 'TBD',
    topic: sanitize(q.topic),
    text: sanitize(q.text),
    options: typeof q.options === 'string' ? sanitize(q.options) : sanitize(JSON.stringify(q.options)),
    correct_id: q.correctId,
    explanation: sanitize(q.explanation),
  }))

  // validations
  function hasNullChars(obj) {
    const s = JSON.stringify(obj)
    return /\\u0000/.test(s)
  }

  console.log('\nNotebook row:')
  console.log(nbRow)
  console.log('\nSources payload:')
  console.log(sourcesPayload)
  console.log('\nQuestions payload (first 2):')
  console.log(questionsPayload.slice(0, 2))

  const problems = []
  if (hasNullChars(nbRow)) problems.push('NUL in notebook row')
  if (hasNullChars(sourcesPayload)) problems.push('NUL in sources payload')
  if (hasNullChars(questionsPayload)) problems.push('NUL in questions payload')

  // verify options parse
  for (const q of questionsPayload) {
    try {
      const opt = JSON.parse(q.options)
      if (!Array.isArray(opt) && typeof opt !== 'object') {
        problems.push('options not a JSON array/object')
        break
      }
    } catch (e) {
      problems.push('options JSON parse error: ' + e.message)
      break
    }
  }

  if (problems.length === 0) {
    console.log('\nValidation: OK — no NUL chars and options are valid JSON')
  } else {
    console.error('\nValidation problems:', problems)
  }

  // Optional: attempt DB insert? skip by default
  console.log('\nSimulation complete — no DB changes were made.')
}

run().catch((e) => { console.error('Simulation error:', e); process.exit(1) })
