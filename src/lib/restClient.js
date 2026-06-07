// Lightweight REST helper for PostgREST (Supabase) using Vite env vars
const REST_URL = import.meta.env.VITE_SUPABASE_REST_URL || (
  import.meta.env.VITE_SUPABASE_URL ? `${import.meta.env.VITE_SUPABASE_URL.replace(/\/$/, '')}/rest/v1/` : ''
)

const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

function buildUrl(path = '', params = {}) {
  const base = REST_URL || ''
  const p = path.replace(/^\//, '')
  const url = base.endsWith('/') ? `${base}${p}` : `${base}/${p}`
  const keys = Object.keys(params || {})
  if (!keys.length) return url
  const qs = new URLSearchParams()
  keys.forEach(k => {
    if (params[k] != null) qs.append(k, String(params[k]))
  })
  return `${url}?${qs.toString()}`
}

export async function restFetch(path, { method = 'GET', body, params, headers = {} } = {}) {
  const url = buildUrl(path, params)
  const opts = {
    method,
    headers: {
      apikey: ANON_KEY,
      Authorization: `Bearer ${ANON_KEY}`,
      ...headers,
    },
  }
  if (body != null) {
    opts.body = typeof body === 'string' ? body : JSON.stringify(body)
    opts.headers['Content-Type'] = opts.headers['Content-Type'] || 'application/json'
  }

  const res = await fetch(url, opts)
  const text = await res.text()
  let data
  try { data = text ? JSON.parse(text) : null } catch (e) { data = text }
  if (!res.ok) {
    const err = { status: res.status, statusText: res.statusText, body: data }
    throw err
  }
  return { status: res.status, data }
}

export { REST_URL as restUrl, ANON_KEY as anonKey }

export default { restFetch, restUrl: REST_URL, anonKey: ANON_KEY }
