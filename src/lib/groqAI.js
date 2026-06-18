import { generateContent as dummyGenerateContent } from './dummyAI.js'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'
const MAX_TEXT_CHARS = 6000   // ~3000 tokens for Hebrew (1 token ≈ 1 char in Hebrew)
const BASE_OUTPUT_TOKENS = 2000   // summary budget (~1500 words)
const TOKENS_PER_QUESTION = 600   // per question with options + explanations
const MAX_OUTPUT_TOKENS = 6000    // stays within Groq free-tier 12K TPM limit

function buildPrompt(title, language, questionCount, sourceText) {
  const lang = language === 'he' ? 'Hebrew' : 'English'
  const text = sourceText.slice(0, MAX_TEXT_CHARS) || '(no text — use title only)'

  return `You are an expert academic tutor writing a comprehensive study guide. Return ONLY valid JSON (no markdown fences, no extra text outside the JSON).

JSON schema:
{
  "summary": "string — comprehensive academic summary in ${lang}. REQUIREMENTS: (1) minimum 500 words, write densely and thoroughly, (2) cover EVERY topic and concept from the material — do not skip or abbreviate anything, (3) use ## for each major topic heading, (4) use ### for subtopics where relevant, (5) bold key terms inline using **term**: definition, (6) include a ## Key Terms section listing every important term as **term**: definition, (7) end with a ## Summary section. Be thorough and educational.",
  "questions": [
    {
      "id": "q-1",
      "topic": "2-4 word topic in ${lang}",
      "text": "question in ${lang}",
      "options": [
        {"id": "a", "text": "option text", "explanation": "1 sentence why correct/wrong in ${lang}"},
        {"id": "b", "text": "option text", "explanation": "1 sentence why correct/wrong in ${lang}"},
        {"id": "c", "text": "option text", "explanation": "1 sentence why correct/wrong in ${lang}"},
        {"id": "d", "text": "option text", "explanation": "1 sentence why correct/wrong in ${lang}"}
      ],
      "correctId": "a",
      "explanation": "2 sentences on the correct concept in ${lang}"
    }
  ]
}

Rules:
- All text in ${lang}
- Summary MUST cover ALL topics present in the material — scan the entire text and ensure nothing is omitted
- Generate exactly ${questionCount} questions spread across different topics
- Mix question types: definitions, cause-effect, comparisons, applications
- Each option explanation: correct → why right, wrong → why wrong

Title: "${title}"
Material:
${text}`
}

function normalizeParsed(parsed, language, questionCount) {
  const questions = (parsed.questions || []).slice(0, questionCount).map((q, i) => ({
    id: q.id || `q-${i + 1}`,
    topic: q.topic || (language === 'he' ? `נושא ${i + 1}` : `Topic ${i + 1}`),
    text: q.text || '',
    options: (q.options || []).map((o) => ({ id: o.id, text: o.text || '', explanation: o.explanation || '' })),
    correctId: q.correctId || 'a',
    explanation: q.explanation || '',
  }))

  return { summary: parsed.summary || '', questions, generatedAt: Date.now() }
}

export async function generateContent({ title, language, questionCount, sourceText = '' }) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY

  if (!apiKey) {
    console.warn('[StudyRush] No VITE_GROQ_API_KEY found — using dummyAI')
    return dummyGenerateContent({ title, language, questionCount, sourceText })
  }

  console.log(`[StudyRush] Calling Groq API for "${title}" (${questionCount} questions, ${sourceText.length} chars)`)

  const prompt = buildPrompt(title, language, questionCount, sourceText)

  let response
  try {
    response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.6,
        max_tokens: Math.min(MAX_OUTPUT_TOKENS, BASE_OUTPUT_TOKENS + questionCount * TOKENS_PER_QUESTION),
      }),
    })
  } catch (err) {
    console.warn('[StudyRush] Groq fetch failed, falling back to dummyAI:', err)
    return dummyGenerateContent({ title, language, questionCount, sourceText })
  }

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    console.warn('[StudyRush] Groq API error', response.status, body, '— falling back to dummyAI')
    return dummyGenerateContent({ title, language, questionCount, sourceText })
  }

  const data = await response.json()
  const raw = data.choices?.[0]?.message?.content ?? ''

  // Strip markdown code fences the model sometimes adds despite not being asked
  const jsonStr = raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim()

  let parsed
  try {
    parsed = JSON.parse(jsonStr)
  } catch {
    console.warn('[StudyRush] Failed to parse Groq JSON response — falling back to dummyAI')
    return dummyGenerateContent({ title, language, questionCount, sourceText })
  }

  console.log(`[StudyRush] Groq responded — ${parsed.questions?.length ?? 0} questions generated`)
  return normalizeParsed(parsed, language, questionCount)
}

export { detectLangFromName } from './dummyAI.js'
