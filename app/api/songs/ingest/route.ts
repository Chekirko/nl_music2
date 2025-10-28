import { NextRequest } from "next/server";
import { connectToDB } from "@/utils/database";
import Song from "@/models/song";
import { GoogleGenAI } from "@google/genai";
import { getServerSession } from "next-auth";
import { authConfig } from "@/configs/auth";

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const buildPrompt = (url: string) => {
  return `You are given a public webpage URL that may contain lyrics and chords of a song.
Goal: Extract the song to strict JSON matching this schema. Return ONLY raw JSON, no backticks, no prose.

Song schema (JSON object):
{
  "title": string,                 // required; song title (але тільки назва, без автора)
  "key": string,                   // required; tonic like A, B, C#, Dm, F#m, etc (use real detected key, not the site label if it seems wrong)
  "origin": string,                // required; the original page URL
  "video": string,                 // optional; embeddable YouTube URL like https://www.youtube.com/embed/<id>
  "blocks": [                      // required; array of blocks
    {
      "name": string,              // required; e.g., "Приспів", "Куплет", "Бридж", "Інтро", "Програш" використовуй назви як в оригіналі
      "version": "1"|"2"|"3",     // 1: words+chords; 2: only words; 3: only chords
      "lines": string,             // required; full block with line breaks (\n). If version=1, chords and text MUST be separate lines, alternating: chords line, lyrics line, chords line, lyrics line ...
      "ind": string                // required; index of the block starting from 0 as string ("0", "1", ...)
    }
  ]
}

Rules:
- Do not include optional properties if unknown.
- title, key, origin, blocks are required; origin must equal: ${url}
- Detect the actual musical key; if site shows wrong key, fix it.
- Ensure chords are placed on their own lines, not inline with lyrics.
- If there is no song on the page, return this exact JSON: {"status":"not_found","reason":"No song detected"}
- Video:  important!!! explicitly search the page for an embedded player. Prefer an <iframe> with src containing "youtube.com/embed/...". If only YouTube links (watch?v=... / youtu.be/...) are present, CONVERT to "https://www.youtube.com/embed/<id>". Include "video" only if it actually exists on the page; do NOT fabricate.

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
    const session = await getServerSession(authConfig);
    if (!session || session.user?.role !== "admin") {
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
        JSON.stringify({ error: "РџРѕСЃРёР»Р°РЅРЅСЏ РЅРµРґС–Р№СЃРЅРµ" }),
        {
          status: 400,
        }
      );
    }

    const parsed = await callGemini(url);
    if (parsed?.status === "not_found") {
      return new Response(
        JSON.stringify({
          error: "РџС–СЃРЅСЋ РЅРµ Р·РЅР°Р№РґРµРЅРѕ РЅР° СЃС‚РѕСЂС–РЅС†С–",
        }),
        { status: 422 }
      );
    }

    // Minimal validation
    if (!parsed?.title || !parsed?.key || !Array.isArray(parsed?.blocks)) {
      return new Response(
        JSON.stringify({
          error:
            "РќРµРїСЂР°РІРёР»СЊРЅРёР№ С„РѕСЂРјР°С‚ РІС–РґРїРѕРІС–РґС– РЁР†",
        }),
        { status: 422 }
      );
    }

    // Ensure origin present
    parsed.origin = url;

    await connectToDB();
    const newSong = new Song(parsed);
    await newSong.save();

    return new Response(JSON.stringify(newSong), { status: 201 });
  } catch (err: any) {
    console.error("INGEST_ERROR", err);
    return new Response(
      JSON.stringify({
        error: "РќРµ РІРґР°Р»РѕСЃСЏ СЃС‚РІРѕСЂРёС‚Рё РїС–СЃРЅСЋ",
      }),
      { status: 500 }
    );
  }
};
