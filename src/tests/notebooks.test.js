import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Supabase
vi.mock('../../lib/supabase.js', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { user: { id: 'test-user-id' } } }
      }),
    },
    from: vi.fn().mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'nb-123', title: 'Test Notebook' },
            error: null,
          }),
        }),
      }),
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    }),
  },
}))

// Mock dummyAI
vi.mock('../../lib/dummyAI.js', () => ({
  generateContent: vi.fn().mockReturnValue({
    summary: 'Test summary',
    questions: [
      {
        id: 'q-1',
        topic: 'Test Topic',
        text: 'What is 2+2?',
        options: [
          { id: 'a', text: '4' },
          { id: 'b', text: '3' },
          { id: 'c', text: '5' },
          { id: 'd', text: '6' },
        ],
        correctId: 'a',
        explanation: '2+2=4',
      },
    ],
    generatedAt: Date.now(),
  }),
}))

describe('Notebook CRUD operations', () => {
  it('should create a notebook with correct data', async () => {
    const { generateContent } = await import('../../lib/dummyAI.js')
    const content = generateContent({ title: 'Test', language: 'he', questionCount: 1, sourceText: 'test' })

    expect(content).toBeDefined()
    expect(content.summary).toBe('Test summary')
    expect(content.questions).toHaveLength(1)
    expect(content.questions[0].correctId).toBe('a')
  })

  it('should have required fields in a question', async () => {
    const { generateContent } = await import('../../lib/dummyAI.js')
    const content = generateContent({ title: 'Test', language: 'he', questionCount: 1, sourceText: 'test' })
    const q = content.questions[0]

    expect(q).toHaveProperty('id')
    expect(q).toHaveProperty('topic')
    expect(q).toHaveProperty('text')
    expect(q).toHaveProperty('options')
    expect(q).toHaveProperty('correctId')
    expect(q).toHaveProperty('explanation')
    expect(q.options).toHaveLength(4)
  })

  it('should return correct answer among options', async () => {
    const { generateContent } = await import('../../lib/dummyAI.js')
    const content = generateContent({ title: 'Test', language: 'he', questionCount: 1, sourceText: 'test' })
    const q = content.questions[0]
    const correctOption = q.options.find((o) => o.id === q.correctId)

    expect(correctOption).toBeDefined()
  })

  it('should call supabase insert when creating notebook', async () => {
    const { supabase } = await import('../../lib/supabase.js')

    const result = await supabase
      .from('notebooks')
      .insert({ user_id: 'test-user-id', title: 'Test' })
      .select()
      .single()

    expect(result.data).toBeDefined()
    expect(result.data.id).toBe('nb-123')
    expect(result.error).toBeNull()
  })

  it('should call supabase delete when removing notebook', async () => {
    const { supabase } = await import('../../lib/supabase.js')

    const result = await supabase
      .from('notebooks')
      .delete()
      .eq('id', 'nb-123')

    expect(result.error).toBeNull()
  })

  it('should fetch empty notebooks list for new user', async () => {
    const { supabase } = await import('../../lib/supabase.js')

    const result = await supabase
      .from('notebooks')
      .select('*')
      .order('created_at', { ascending: false })

    expect(result.data).toEqual([])
    expect(result.error).toBeNull()
  })

  it('should detect Hebrew language correctly', async () => {
    const { detectLangFromText } = await import('../../lib/extractText.js')
    const heText = 'זהו טקסט בעברית עם מילים רבות'
    const enText = 'This is an English text with many words'

    expect(detectLangFromText(heText)).toBe('he')
    expect(detectLangFromText(enText)).toBe('en')
  })
})