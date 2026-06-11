export async function extractText(file) {
  const name = file.name.toLowerCase()

  // DOCX — use mammoth
  if (name.endsWith('.docx') || name.endsWith('.doc')) {
    try {
      const arrayBuffer = await file.arrayBuffer()
      // load mammoth dynamically (avoid bundling failure in Vite when module isn't present)
      let mammoth
      try {
        const mod = await import(/* @vite-ignore */ 'mammoth')
        mammoth = mod?.default || mod
      } catch (e) {
        // try browser build path as fallback
        try {
          const mod = await import(/* @vite-ignore */ 'mammoth/mammoth.browser')
          mammoth = mod?.default || mod
        } catch (err) {
          console.warn('mammoth not available in this environment; DOCX extraction skipped', err)
          return ''
        }
      }

      const result = await mammoth.extractRawText({ arrayBuffer })
      return result.value || ''
    } catch (e) {
      console.error('DOCX extraction error:', e)
      return ''
    }
  }

  // PDF — return placeholder (real extraction needs pdfjs)
  if (file.type === 'application/pdf' || name.endsWith('.pdf')) {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdfjsLib = await import('pdfjs-dist')
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      let text = ''
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        text += content.items.map((item) => item.str).join(' ') + '\n'
      }
      return text
    } catch (e) {
      console.error('PDF extraction error:', e)
      return `[PDF: ${file.name}]`
    }
  }

  // TXT / MD — plain text
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result || '')
    reader.onerror = () => resolve('')
    reader.readAsText(file)
  })
}

export function detectLangFromText(text) {
  const he = (text.match(/[\u0590-\u05FF]/g) || []).length
  const en = (text.match(/[A-Za-z]/g) || []).length
  return he > en ? 'he' : 'en'
}