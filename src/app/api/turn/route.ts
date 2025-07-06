import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabaseClient';

export async function POST(req: NextRequest) {
  const { input, side, topic, history } = await req.json();

  const opp = side === 'pro' ? 'con' : 'pro';
  const userRole = side === 'pro' ? 'User (Pro)' : 'User (Con)';
  const aiRole = opp === 'pro' ? 'AI (Pro)' : 'AI (Con)';

  // Format turn history
  const formattedHistory = history
    .map((msg: string, index: number) => {
      const isUser = index % 2 === 0;
      return `${isUser ? userRole : aiRole}: ${msg}`;
    })
    .join('\n');

  const fullPrompt = `
Topic: ${topic}

${formattedHistory}
${userRole}: ${input}

Now respond as ${aiRole} directly to the last user statement in 2–3 sentences.
`;

  const toolDefinition = {
    functionDeclarations: [
      {
        name: "analyzeArgument",
        description: "Analyze the user's argument for quality.",
        parameters: {
          type: "object",
          properties: {
            fallacies: {
              type: "array",
              items: { type: "string" },
              description: "List any logical fallacies in the user's argument",
            },
            counterpoints: {
              type: "string",
              description: "Briefly list what counterpoints the user failed to address",
            },
            strength: {
              type: "integer",
              minimum: 1,
              maximum: 10,
              description: "Rate the strength of the user's argument from 1–10",
            },
          },
          required: ["fallacies", "counterpoints", "strength"],
        },
      },
    ],
  };

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullPrompt }] }],
          tools: toolDefinition,
          toolConfig: {
            functionCallingConfig: {
              mode: "AUTO",
            },
          },
        }),
      }
    );

    const result = await response.json();

    console.log('🧠 AI Result:', result); // <-- Helpful for debugging

    const aiReply =
      result.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

    const functionCall =
      result.candidates?.[0]?.content?.parts?.find((p: any) => p.functionCall)
        ?.functionCall;

    const analysis = functionCall?.args || null;

    return NextResponse.json({ reply: aiReply, analysis });
  } catch (err: any) {
    console.error('❌ API Error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
