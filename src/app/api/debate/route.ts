import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { topic } = await req.json();

  if (!topic) {
    return NextResponse.json({ error: "Missing topic" }, { status: 400 });
  }

  const prompt = `
Debate Topic: ${topic}

Pro:
<Arguments supporting the topic>

Con:
<Arguments opposing the topic>

Start with "Pro:" and then "Con:" on new lines.
`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        }),
      }
    );

    const result = await response.json();
    console.log("🔍 Gemini Response:", result);

    if (!response.ok || result.error) {
      return NextResponse.json({ error: result.error?.message || "Gemini API Error" }, { status: 500 });
    }

    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';

    const proMatch = text.match(/Pro:\s*([\s\S]*?)(?:Con:|$)/i);
    const conMatch = text.match(/Con:\s*([\s\S]*)/i);

    const pro = proMatch?.[1]?.trim() || '⚠️ No Pro section found.';
    const con = conMatch?.[1]?.trim() || '⚠️ No Con section found.';

    return NextResponse.json({ pro, con, raw: text });
  } catch (err: any) {
    console.error("❌ Gemini API Error:", err.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
