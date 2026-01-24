import { NextRequest } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { canCreateSong } from "@/lib/permissions";

// Ensure Node.js runtime on Vercel (avoids Edge 5s timeout)
export const runtime = "nodejs";
// Allow longer processing (Vercel Pro up to 60s; safely ignored on plans that don't support)
export const maxDuration = 60;
export const dynamic = "force-dynamic";

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const buildPrompt = (url: string) => {
  return `You are given a public webpage URL that may contain lyrics and chords of a song.
Goal: Extract the song to strict JSON matching this schema. Return ONLY raw JSON, no backticks, no prose.

Song schema (JSON object):
{
  "title": string,                 // required; song title (але тільки назва, без автора)
  "key": string,                   // required; musical key like A, B, C#, Dm, F#m, etc (see KEY DETECTION section below)
  "origin": string,                // required; the original page URL
  "video": string,                 // optional; embeddable YouTube URL like https://www.youtube.com/embed/<id>
  "blocks": [                      // required; array of blocks
    {
      "name": string,              // required; e.g., "Приспів", "Куплет", "Бридж", "Інтро", "Програш" використовуй назви як в оригіналі
      "version": "1"|"2"|"3",     // 1: words+chords; 2: only words; 3: only chords
      "lines": string,             // required; full block with line breaks (\\n). See LINE FORMATTING section below.
      "ind": string                // required; index of the block starting from 0 as string ("0", "1", ...)
    }
  ]
}

=== KEY DETECTION (CRITICAL!) ===
To determine the correct musical key:
1. FIRST, note what key the website displays (if any)
2. THEN, analyze the ENTIRE chord progression of the song
3. Look for these indicators:
   - The chord the song RESOLVES to (usually at the end of phrases)
   - The most frequently used chord
   - The chord that feels like "home" or "rest"
   - Common progressions: if you see Am-Dm-G-C, the key is likely C major or A minor
4. The FIRST chord is NOT always the key! For example, a song starting with Em might be in G major
5. If minor, use lowercase 'm' suffix (e.g., "Am", "F#m", "Dm")
6. If major, use just the note name (e.g., "C", "G", "D")
7. Compare your analysis with the website's stated key - if they match, use it; if they differ, use YOUR analyzed key

=== LINE FORMATTING (CRITICAL!) ===
For version=1 blocks (words + chords), you MUST format lines as STRICTLY ALTERNATING:
- Line 1: CHORDS ONLY (e.g., "Am    C    G    F")
- Line 2: LYRICS ONLY (the text that sings under those chords)
- Line 3: CHORDS ONLY
- Line 4: LYRICS ONLY
...and so on.

IMPORTANT RULES for line breaks:
1. Each PHRASE of lyrics should be on its own line (typically matching how the singer would phrase it)
2. If the original has chords INLINE with text (like "Am слова C слова"), you MUST split them:
   - Put all chords on one line: "Am    C"
   - Put lyrics on the next line: "слова слова"
3. Align chord positions roughly above the syllables where they change, but as separate lines
4. Use \\n for line breaks in the "lines" string
5. Empty lines between sections are OK for readability

EXAMPLE of CORRECT version=1 formatting:
"lines": "Am    C    G\\nЯ йду по дорозі далекій\\nF    C    Am\\nІ бачу зорі в небі"

=== OTHER RULES ===
- Do not include optional properties if unknown.
- title, key, origin, blocks are required; origin must equal: ${url}
- If there is no song on the page, return this exact JSON: {"status":"not_found","reason":"No song detected"}
- Video: Проведи ретельне дослідження сторінки на наявність вбудованого відео з Ютуб. Prefer an <iframe> with src containing "youtube.com/embed/...". If only YouTube links (watch?v=... / youtu.be/...) are present, CONVERT to "https://www.youtube.com/embed/<id>". Include "video" only if it actually exists on the page; do NOT fabricate.

Important:
- You MUST retrieve and read the content of the provided URL using the urlContext tool.
- Do NOT fabricate; only extract data that is actually present on the page. If uncertain, omit optional fields.

Now analyze the page and respond as JSON only.`;
};

async function callGemini(inputUrl: string) {
  const ai = new GoogleGenAI({}); // uses GEMINI_API_KEY from env
  const prompt = buildPrompt(inputUrl);
  const response: any = await ai.models.generateContent({
    model: MODEL,
    contents: [prompt, inputUrl],
    config: {
      tools: [{ urlContext: {} }],
    },
  });
  const text =
    typeof response?.text === "function" ? response.text() : response?.text;
  const output = await Promise.resolve(text);
  if (!output || typeof output !== "string") {
    throw new Error("Empty response from Gemini");
  }
  const cleaned = output
    .trim()
    .replace(/^```json/gi, "")
    .replace(/^```/gi, "")
    .replace(/```$/gi, "");
  return JSON.parse(cleaned);
}

export const POST = async (req: NextRequest) => {
  try {
    // Use team permission check instead of app-level admin
    const access = await canCreateSong();
    if (!access.ok) {
      return new Response(JSON.stringify({ error: "Access denied" }), {
        status: 403,
      });
    }

    const { url } = await req.json();
    try {
      const u = new URL(url);
      if (!u.protocol || !u.host) throw new Error("bad");
    } catch {
      return new Response(
        JSON.stringify({ error: "Посилання недійсне" }),
        { status: 400 }
      );
    }

    const parsed = await callGemini(url);
    if (parsed?.status === "not_found") {
      return new Response(
        JSON.stringify({ error: "Пісню не знайдено на сторінці" }),
        { status: 422 }
      );
    }

    // Minimal validation
    if (!parsed?.title || !parsed?.key || !Array.isArray(parsed?.blocks)) {
      return new Response(
        JSON.stringify({ error: "Неправильний формат відповіді ШІ" }),
        { status: 422 }
      );
    }

    // Normalize blocks to ensure version is number
    const normalizedBlocks = parsed.blocks.map((b: any, idx: number) => ({
      name: b.name || "",
      version: Number(b.version) || 1,
      lines: b.lines || "",
      ind: b.ind !== undefined ? Number(b.ind) : idx,
    }));

    // Return parsed data for client to use with createSongAction
    return new Response(
      JSON.stringify({
        title: parsed.title,
        key: parsed.key,
        origin: url,
        video: parsed.video || "",
        blocks: normalizedBlocks,
      }),
      { status: 200 }
    );
  } catch (err: any) {
    console.error("INGEST_ERROR", err);
    return new Response(
      JSON.stringify({ error: "Не вдалося опрацювати сторінку" }),
      { status: 500 }
    );
  }
};
