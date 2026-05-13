// Simplified text extraction for frontend-only demo
export async function extractText(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result || '');
    reader.onerror = () => resolve('');
    if (file.type === 'application/pdf') {
      resolve(`[PDF content from: ${file.name}]`);
    } else {
      reader.readAsText(file);
    }
  });
}

export function detectLangFromText(text) {
  const he = (text.match(/[\u0590-\u05FF]/g) || []).length;
  const en = (text.match(/[A-Za-z]/g) || []).length;
  return he > en ? 'he' : 'en';
}
