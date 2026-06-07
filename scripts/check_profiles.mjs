import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Simple .env parser (no external deps) — loads VITE_SUPABASE_* into process.env
try {
  const envPath = path.resolve(process.cwd(), '.env')
  if (fs.existsSync(envPath)) {
    const raw = fs.readFileSync(envPath, 'utf8')
    raw.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) return
      const idx = trimmed.indexOf('=')
      if (idx === -1) return
      const key = trimmed.substring(0, idx).trim()
      let val = trimmed.substring(idx + 1).trim()
      if ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"'))) {
        val = val.substring(1, val.length - 1)
      }
      if (!(key in process.env)) process.env[key] = val
    })
  }
} catch (e) {
  // ignore
}

const url = process.env.VITE_SUPABASE_URL
const key = process.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env')
  process.exit(2)
}

const supabase = createClient(url, key)

async function listProfiles() {
  try {
    const { data, error } = await supabase.from('profiles').select('*').limit(50)
    if (error) {
      console.error('Supabase error:', error)
      process.exit(1)
    }
    console.log('profiles rows:', data && data.length ? data : 'EMPTY')
  } catch (err) {
    console.error('Unexpected error:', err)
    process.exit(1)
  }
}

listProfiles()
