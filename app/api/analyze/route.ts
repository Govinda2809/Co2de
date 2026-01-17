export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { AIReviewSchema } from '@/lib/schemas';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export async function POST(request: Request) {
  try {
    const { code, mode } = await request.json();

    if (!OPENROUTER_API_KEY) {
      return NextResponse.json({ error: "API Key missing" }, { status: 500 });
    }

    const systemPrompt = mode === 'refactor' 
      ? "You are a Green Software Engineer. Refactor the provided code for MAXIMUM energy efficiency and minimum CPU cycles. Return ONLY a JSON object with 'refactoredCode' and 'explanation' fields. Keep the same logic but optimize loops, memory, and calls."
      : "Analyze the provided code for carbon footprint and energy efficiency. Return a valid JSON object matching this schema: { score: number (1-10), bottleneck: string, optimization: string, improvement: string }.";

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-exp:free",
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: code }],
        response_format: { type: "json_object" }
      }),
    });

    const data = await response.json();
    const content = JSON.parse(data.choices[0].message.content);

    if (mode === 'refactor') {
      return NextResponse.json({ 
        refactoredCode: content.refactoredCode, 
        explanation: content.explanation 
      });
    }

    // Validate review schema
    const validated = AIReviewSchema.parse(content);
    return NextResponse.json({ review: validated });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
