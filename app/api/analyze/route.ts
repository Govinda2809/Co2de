export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { AIReviewSchema } from '@/lib/schemas';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MULEROUTER_API_KEY = process.env.MULEROUTER_API_KEY;

async function callAI(code: string, systemPrompt: string, apiKey: string, url: string, model: string) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: model,
      messages: [{ role: "system", content: systemPrompt }, { role: "user", content: code }],
      response_format: { type: "json_object" }
    }),
  });

  if (!response.ok) throw new Error(`${url} failed: ${response.statusText}`);
  const data = await response.json();
  if (!data.choices?.[0]?.message?.content) throw new Error("Invalid response structure");
  return JSON.parse(data.choices[0].message.content);
}

export async function POST(request: Request) {
  try {
    const { code, mode, metrics } = await request.json();

    let systemPrompt = "";
    if (mode === 'refactor') {
      systemPrompt = "You are a Green Software Engineer. Refactor the provided code for MAXIMUM energy efficiency and minimum CPU cycles. Return ONLY a JSON object with 'refactoredCode' and 'explanation' fields. Keep the same logic but optimize loops, memory, and calls.";
    } else {
      const context = metrics ? `\nContext: Complexity Factor=${metrics.complexity}, Language=${metrics.language}, Lines=${metrics.lineCount}` : "";
      systemPrompt = `Analyze the provided code for carbon footprint and energy efficiency. ${context}\nReturn a valid JSON object matching this schema: { score: number (1-10), bottleneck: string, optimization: string, improvement: string }. Use the provided complexity metrics to inform your score.`;
    }

    let content;
    try {
      // Primary: OpenRouter
      if (!OPENROUTER_API_KEY) throw new Error("OpenRouter Key missing");
      content = await callAI(code, systemPrompt, OPENROUTER_API_KEY, "https://openrouter.ai/api/v1/chat/completions", "google/gemini-2.0-flash-exp:free");
    } catch (e) {
      console.warn("Primary Router Failed, engaging Fallback Protocol...", e);
      // Fallback: MuleRouter or another provider
      if (!MULEROUTER_API_KEY) throw new Error("Both Primary and Fallback keys missing.");
      content = await callAI(code, systemPrompt, MULEROUTER_API_KEY, "https://mulerouter.com/api/v1/chat/completions", "meta-llama/llama-3-8b-instruct");
    }

    if (mode === 'refactor') {
      return NextResponse.json({ 
        refactoredCode: content.refactoredCode || "Code optimization failed.", 
        explanation: content.explanation || "No explanation provided." 
      });
    }

    const validated = AIReviewSchema.parse(content);
    return NextResponse.json({ review: validated });

  } catch (error: any) {
    console.error("Critical API Failure:", error);
    return NextResponse.json({ error: "Analysis engine offline: " + error.message }, { status: 500 });
  }
}
