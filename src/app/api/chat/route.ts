import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabaseClient';

export async function POST(req: NextRequest) {
  const { topic } = await req.json();

  const prompt = `Debate Topic: ${topic}

Pro: <Give pro-side opinion>

Con: <Give con-side opinion>

Start with "Pro:" and then "Con:"`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';

    const proMatch = text.match(/Pro:\s*([\s\S]*?)(?:Con:|$)/i);
    const conMatch = text.match(/Con:\s*([\s\S]*)/i);

    const pro = proMatch?.[1]?.trim() || '⚠️ Pro missing';
    const con = conMatch?.[1]?.trim() || '⚠️ Con missing';

    // ✅ Try to get the user session from Supabase
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user) {
      await supabase.from('debates').insert({
        user_id: session.user.id,
        topic,
        mode: 'chat',
        pro,
        con,
      });
    }

    return NextResponse.json({ pro, con });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
