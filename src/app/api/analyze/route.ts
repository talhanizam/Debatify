import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { argument, topic, side } = await req.json();

  const toolDefinition = [
  {
    functionDeclarations: [
      {
        name: "analyze_argument",
        description: "Analyze an argument for logical fallacies, counterpoints, strength, and improvements.",
        parameters: {
          type: "object",
          properties: {
            fallacies: {
              type: "array",
              items: { type: "string" },
              description: "List of logical fallacies found in the argument."
            },
            counterpoints: {
              type: "string",
              description: "Counterpoints the user has missed."
            },
            strength: {
              type: "integer",
              minimum: 1,
              maximum: 10,
              description: "Rating of the argument strength (1–10)."
            },
            improvement: {
              type: "string",
              description: "Suggestions to improve the argument."
            }
          },
          required: ["fallacies", "counterpoints", "strength", "improvement"]
        }
      }
    ]
  }
];

const payload = {
  contents: [
    {
      role: "user",
      parts: [
        {
          text: `Analyze this argument:\n\n"${argument}"\n\nTopic: "${topic}"\nSide: "${side.toUpperCase()}"`
        }
      ]
    }
  ],
  tools: toolDefinition,
  toolConfig: { functionCallingConfig: { mode: "AUTO" } }
};


  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }
    );

    const result = await response.json();
    console.log('🧪 Analyze API Result:', JSON.stringify(result, null, 2));

    let analysis = null;

    const toolCall = result.candidates?.[0]?.content?.parts?.find(
      (p: any) => p.functionCall
    )?.functionCall;

    if (toolCall?.args) {
      analysis = toolCall.args;
    } else if (toolCall?.arguments) {
      try {
        analysis = JSON.parse(toolCall.arguments); // fallback
      } catch (err) {
        console.error("❌ Failed to parse function call arguments", err);
      }
    }

    return NextResponse.json({ analysis });
  } catch (error: any) {
    console.error('❌ Analyze API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
