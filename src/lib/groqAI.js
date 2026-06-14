import { generateContent as dummyGenerateContent } from './dummyAI.js'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'
const MAX_TEXT_CHARS = 48000

function buildPrompt(title, language, questionCount, sourceText) {
  const langName = language === 'he' ? 'Hebrew' : 'English'
  const isHe = language === 'he'
  const truncated = sourceText.slice(0, MAX_TEXT_CHARS)

  const summaryExample = isHe
    ? `"## מבוא\\nפסקה של 3-4 משפטים המסבירה את הנושא הכללי ומה המסמך עוסק בו.\\n\\n## נושא 1: [שם הנושא]\\nהסבר מפורט של 3-5 משפטים. פרט את הרעיונות המרכזיים, הסיבות והמשמעויות.\\n\\n## נושא 2: [שם הנושא]\\nהסבר מפורט של 3-5 משפטים...\\n\\n## מושגי מפתח\\n• **מושג א**: הגדרה ברורה ותמציתית\\n• **מושג ב**: הגדרה ברורה ותמציתית\\n• **מושג ג**: הגדרה ברורה ותמציתית\\n\\n## סיכום\\nפסקת סיכום של 3-4 משפטים המסכמת את הנקודות העיקריות ומה ניתן ללמוד מהם."`
    : `"## Introduction\\n3-4 sentences explaining the topic and what the document covers.\\n\\n## Topic 1: [Topic Name]\\n3-5 sentences of detailed explanation covering the main ideas, causes, and significance.\\n\\n## Topic 2: [Topic Name]\\n3-5 sentences...\\n\\n## Key Terms\\n• **Term A**: clear and concise definition\\n• **Term B**: clear and concise definition\\n\\n## Summary\\n3-4 sentence conclusion summarizing the main takeaways."`

  return `You are an expert academic summarizer and quiz generator. Given the study material below, produce a comprehensive summary and quiz questions — all in ${langName}.

IMPORTANT: Return ONLY a valid JSON object — no markdown fences, no extra text outside the JSON.

JSON structure:
{
  "summary": ${summaryExample},
  "questions": [
    {
      "id": "q-1",
      "topic": "Short topic (2-4 words in ${langName})",
      "text": "Question text in ${langName}",
      "options": [
        {"id": "a", "text": "...", "explanation": "Why this option is correct (1-2 sentences in ${langName})"},
        {"id": "b", "text": "...", "explanation": "Why this option is wrong (1-2 sentences in ${langName})"},
        {"id": "c", "text": "...", "explanation": "Why this option is wrong (1-2 sentences in ${langName})"},
        {"id": "d", "text": "...", "explanation": "Why this option is wrong (1-2 sentences in ${langName})"}
      ],
      "correctId": "a",
      "explanation": "2-3 sentence explanation of the correct concept in ${langName}"
    }
  ]
}

Summary rules:
- Write a DETAILED, ACADEMIC summary — minimum 400 words
- Use the ## heading format shown above
- Include: Introduction, 3-6 main topic sections (based on content), Key Terms, Summary
- Each section must have full explanatory paragraphs, not just bullet points
- Key Terms section uses bullet points with bold term + colon + definition
- ALL text must be in ${langName}

Quiz rules:
- Generate exactly ${questionCount} questions
- ALL quiz text must be in ${langName}
- Base questions directly on the material — no generic questions
- Mix types: definitions, cause-and-effect, comparisons, applications
- Make distractors plausible but clearly wrong
- Each option MUST have an "explanation" field: for the correct option explain why it's right; for wrong options explain specifically why that option is incorrect
- The top-level "explanation" field should be a 2-3 sentence summary of the correct concept

Title: "${title}"
Material:
${truncated || '(No text extracted — generate content based on the title only)'}`
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

  return {
    summary: parsed.summary || '',
    questions,
    generatedAt: Date.now(),
  }
}

export async function generateContent({ title, language, questionCount, sourceText = '' }) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY

  if (!apiKey) {
    return dummyGenerateContent({ title, language, questionCount, sourceText })
  }

  const prompt = buildPrompt(title, language, questionCount, sourceText)

  let response
  try {
    response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.6,
        max_tokens: 6000,
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

  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch {
    console.warn('[StudyRush] Failed to parse Groq JSON response — falling back to dummyAI')
    return dummyGenerateContent({ title, language, questionCount, sourceText })
  }

  return normalizeParsed(parsed, language, questionCount)
}

export { detectLangFromName } from './dummyAI.js'
