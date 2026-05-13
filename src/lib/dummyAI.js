// Content-aware mock AI: derives summary + quiz directly from extracted text.




  id;
  topic;
  text;
  options: QuizOption[];
  correctId;
  explanation;
}

  summary;
  questions: QuizQuestion[];
  generatedAt;
}

const STOP_HE = new Set(["של","את","על","עם","אבל","הוא","היא","הם","הן","זה","זאת","אני","אתה","אנחנו","יש","אין","לא","כן","גם","כי","אם","או","מה","מי","איך","למה","כמו","היה","היו","יהיה","שלי","שלו","שלה","אחד","אחת","שני","שתי","הזה","הזאת","להיות","יכול","צריך","כל","כדי","לפי","בין","עד","מן","אל","כך","רק","אך","אז","פה","שם","יותר","פחות","כמה","איזה","איזו","אשר","ואת","וגם","עוד"]);
const STOP_EN = new Set(["the","a","an","and","or","but","of","in","on","at","to","for","with","by","is","are","was","were","be","been","being","this","that","these","those","it","its","as","from","into","about","over","than","then","so","not","no","yes","if","because","while","when","where","what","which","who","whom","how","why","can","could","should","would","may","might","will","shall","do","does","did","done","has","have","had","i","you","he","she","we","they","them","their","our","your","my","me","us","also","very","just","more","most","such","each","any","all","one","two","three"]);

const HE_RE = /[\u0590-\u05FF]/;
const LETTER_RE = /[A-Za-z\u0590-\u05FF]/;

function isHebrew(text) {
  const he = (text.match(/[\u0590-\u05FF]/g) || []).length;
  const en = (text.match(/[A-Za-z]/g) || []).length;
  return he > en;
}

function splitSentences(text)[] {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?\u05C3])\s+|\n+|(?<=[.!?])\s|\s•\s|\s·\s/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 20 && s.length <= 500);
}

function tokenize(s)[] {
  return s
    .split(/[^A-Za-z\u0590-\u05FF\d]+/)
    .map((w) => w.trim())
    .filter(Boolean);
}

function isStop(w, lang) {
  const lw = w.toLowerCase();
  if ((lang === "he" ? STOP_HE : STOP_EN).has(lw)) return true;
  if (lang === "he") return lw.length < 3;
  return lw.length < 4;
}

function topKeywords(text, lang, n = 60)[] {
  const freq = new Map<string, number>();
  for (const w of tokenize(text)) {
    if (isStop(w, lang)) continue;
    if (lang === "he" && !HE_RE.test(w)) continue;
    if (lang === "en" && HE_RE.test(w)) continue;
    freq.set(w, (freq.get(w) || 0) + 1);
  }
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)
    .slice(0, n)
    .map(([w]) => w);
}

function makeRng(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

function hashStr(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

function shuffle(arr, rnd: () => number) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickEvenly(arr, n) {
  if (arr.length <= n) return arr.slice();
  const out = [];
  for (let i = 0; i < n; i++) {
    out.push(arr[Math.floor((i * arr.length) / n)]);
  }
  return out;
}

function buildSummary(sentences[], lang, title) {
  if (sentences.length === 0) {
    return lang === "he"
      ? `לא ניתן היה לחלץ טקסט מהקבצים שהועלו עבור "${title}". נסה להעלות קבצים אחרים או לוודא שהקבצים אינם סרוקים בלבד.`
      : `Could not extract text from the uploaded files for "${title}". Try different files or make sure they are not scanned-only.`;
  }
  const top = pickEvenly(sentences, 8);
  const header = lang === "he" ? `סיכום של "${title}":` : `Summary of "${title}":`;
  return header + "\n\n" + top.map((s) => `• ${s}`).join("\n");
}

const BLANK = "_______";

// Replace first occurrence of a word using Unicode-safe boundaries
function replaceWord(sentence, word) | null {
  const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(^|[^A-Za-z\\u0590-\\u05FF\\d])${escaped}(?=$|[^A-Za-z\\u0590-\\u05FF\\d])`);
  const m = sentence.match(re);
  if (!m) return null;
  return sentence.replace(re, `$1${BLANK}`);
}

function buildClozeQuestion(
  sentence,
  keywords[],
  lang,
  rnd: () => number,
  idx
): QuizQuestion | null {
  const words = tokenize(sentence).filter((w) => !isStop(w, lang));
  if (words.length < 3) return null;

  // Prefer same-script words; fall back to any
  const sameScript = words.filter((w) => (lang === "he" ? HE_RE.test(w) : !HE_RE.test(w)));
  const candidates = (sameScript.length >= 1 ? sameScript : words)
    .slice()
    .sort((a, b) => b.length - a.length);

  let answer | null = null;
  let blanked | null = null;
  for (const cand of candidates) {
    const result = replaceWord(sentence, cand);
    if (result && result.includes(BLANK)) {
      answer = cand;
      blanked = result;
      break;
    }
  }
  if (!answer || !blanked) return null;

  // Build distractor pool: keywords excluding answer, prefer same-ish length
  const lc = (s) => s.toLowerCase();
  const pool = keywords.filter((k) => lc(k) !== lc(answer!));
  let distractors = pool
    .filter((k) => Math.abs(k.length - answer!.length) <= 4)
    .slice(0, 8);
  if (distractors.length < 3) {
    distractors = pool.slice(0, 8);
  }
  if (distractors.length < 3) {
    // pad with sentence words
    const extra = words.filter((w) => lc(w) !== lc(answer!) && !distractors.find((d) => lc(d) === lc(w)));
    distractors = [...distractors, ...extra];
  }
  if (distractors.length < 3) return null;

  const picked = shuffle(distractors, rnd).slice(0, 3);
  const all = shuffle([answer, ...picked], rnd);
  const letters = ["a", "b", "c", "d"];
  const options = all.map((text, i) => ({ id: letters[i], text }));
  const correctId = letters[all.indexOf(answer)];

  const stem = lang === "he"
    ? `השלם את המשפט: "${blanked}"`
    : `Fill in the blank: "${blanked}"`;
  const explanation = lang === "he"
    ? `המילה הנכונה היא "${answer}" — היא מופיעה בהקשר הזה בחומר שהועלה.`
    : `The correct term is "${answer}" — it appears in this exact context within the uploaded material.`;
  const topic = lang === "he" ? `מושג מרכזי ${idx}` : `Key concept ${idx}`;

  return { id: `q-${idx}`, topic, text: stem, options, correctId, explanation };
}

// Backup: "which statement appears in the material?" using real sentences
function buildRecallQuestion(
  correctSentence,
  otherSentences[],
  lang,
  rnd: () => number,
  idx
): QuizQuestion | null {
  const distractors = shuffle(otherSentences.filter((s) => s !== correctSentence), rnd).slice(0, 3);
  if (distractors.length < 3) return null;
  const all = shuffle([correctSentence, ...distractors], rnd);
  const letters = ["a", "b", "c", "d"];
  const options = all.map((text, i) => ({ id: letters[i], text }));
  const correctId = letters[all.indexOf(correctSentence)];
  return {
    id: `q-${idx}`,
    topic: lang === "he" ? `זיהוי תוכן ${idx}` : `Recall ${idx}`,
    text: lang === "he" ? "איזה מהמשפטים הבאים מופיע בחומר?" : "Which of the following appears in the material?",
    options,
    correctId,
    explanation: lang === "he"
      ? "המשפט הזה מופיע במקור שהעלית; השאר נוסחו אחרת או אינם בחומר."
      : "This statement is taken directly from the uploaded material; the others are not.",
  };
}

function fallbackQuestion(lang, idx): QuizQuestion {
  const letters = ["a", "b", "c", "d"];
  return {
    id: `q-${idx}`,
    topic: lang === "he" ? "כללי" : "General",
    text: lang === "he"
      ? "לא נמצא מספיק טקסט בחומר ליצירת שאלה איכותית. בחר באפשרות הראשונה כדי להמשיך."
      : "Not enough text was extracted to build a strong question. Pick the first option to continue.",
    options: [
      { id: letters[0], text: lang === "he" ? "המשך" : "Continue" },
      { id: letters[1], text: lang === "he" ? "אופציה ב" : "Option B" },
      { id: letters[2], text: lang === "he" ? "אופציה ג" : "Option C" },
      { id: letters[3], text: lang === "he" ? "אופציה ד" : "Option D" },
    ],
    correctId: letters[0],
    explanation: lang === "he"
      ? "העלה קבצים עם יותר טקסט (לא רק תמונות) כדי לאפשר ל-AI ליצור שאלות אמיתיות."
      : "Upload files with extractable text (not image-only scans) so the AI can build real questions.",
  };
}

export function generateContent(opts: {
  title;
  language;
  questionCount;
  nonce?;
  sourceText?;
}): GeneratedContent {
  const { title, language, questionCount, nonce = 0, sourceText = "" } = opts;
  const seed = hashStr(title + "|" + sourceText.slice(0, 1000)) ^ ((nonce + 1) * 2654435761);
  const rnd = makeRng(seed);

  const text = sourceText.trim();
  const allSentences = splitSentences(text);
  const sentences = shuffle(allSentences, rnd);
  const keywords = topKeywords(text, language, 80);
  const summary = buildSummary(allSentences, language, title);

  if (typeof console !== "undefined") {
    console.log("[StudyRush AI] text length:", text.length, "sentences:", allSentences.length, "keywords:", keywords.length);
  }

  const questions: QuizQuestion[] = [];
  const used = new Set<string>();

  // First pass: cloze questions
  for (const s of sentences) {
    if (questions.length >= questionCount) break;
    if (used.has(s)) continue;
    const q = buildClozeQuestion(s, keywords, language, rnd, questions.length + 1);
    if (q) {
      questions.push(q);
      used.add(s);
    }
  }
  // Second pass: recall questions
  if (questions.length < questionCount && allSentences.length >= 4) {
    for (const s of sentences) {
      if (questions.length >= questionCount) break;
      if (used.has(s)) continue;
      const q = buildRecallQuestion(s, allSentences, language, rnd, questions.length + 1);
      if (q) {
        questions.push(q);
        used.add(s);
      }
    }
  }
  while (questions.length < questionCount) {
    questions.push(fallbackQuestion(language, questions.length + 1));
  }

  return { summary, questions, generatedAt: Date.now() };
}

export function detectLangFromName(name) {
  return isHebrew(name) ? "he" : "en";
}
