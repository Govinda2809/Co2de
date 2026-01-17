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
      "HTTP-Referer": "https://co2de.dev",
      "X-Title": "CO2DE Audit Engine",
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Target Code:\n\n${code}` }
      ],
      response_format: { type: "json_object" }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI Gateway error (${response.status}): ${errorText}`);
  }
  
  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  
  if (!content) throw new Error("AI returned null response content.");
  
  try {
    return JSON.parse(content);
  } catch (e) {
    // Attempt to extract JSON if AI wrapped it in markdown
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    throw new Error("Failed to parse AI response as JSON.");
  }
}

export async function POST(request: Request) {
  try {
    const { code, mode, metrics } = await request.json();

    let systemPrompt = "";
    if (mode === 'refactor') {
      systemPrompt = `You are a Senior Green Software Architect. 
      Refactor the provided code for MAXIMUM energy efficiency. 
      Focus on:
      1. Reducing O(n) complexity to O(1) or O(log n).
      2. Minimizing memory allocations and garbage collection pressure.
      3. Removing redundant computations.
      Return ONLY a JSON object: { "refactoredCode": "string", "explanation": "string" }.`;
    } else {
      const context = metrics ? `\n\nMetric Context: Big_O=${metrics.complexity}, Mem_Pressure=${metrics.memPressure}, Lines=${metrics.lineCount}, Language=${metrics.language}` : "";
      systemPrompt = `You are a Sustainability Auditor. Analyze the code for environmental footprint. ${context}
      Return a JSON object: { "score": number (1-10), "bottleneck": "string", "optimization": "string", "improvement": "string" }.
      Ensure the score reflects the complexity metrics provided.`;
    }

    let content;
    const errors: string[] = [];

    try {
      if (!OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY absent.");
      content = await callAI(code, systemPrompt, OPENROUTER_API_KEY, "https://openrouter.ai/api/v1/chat/completions", "google/gemini-2.0-flash-exp:free");
    } catch (e: any) {
      errors.push(`OpenRouter: ${e.message}`);
      try {
        if (!MULEROUTER_API_KEY) throw new Error("MULEROUTER_API_KEY absent.");
        content = await callAI(code, systemPrompt, MULEROUTER_API_KEY, "https://mulerouter.com/api/v1/chat/completions", "meta-llama/llama-3-8b-instruct");
      } catch (e2: any) {
        errors.push(`MuleRouter: ${e2.message}`);
        throw new Error(`Dual-Router Core Failure: ${errors.join(" | ")}`);
      }
    }

    if (mode === 'refactor') {
      return NextResponse.json({ 
        refactoredCode: content.refactoredCode || code, 
        explanation: content.explanation || "Optimization complete with heuristic defaults." 
      });
    }

    const validated = AIReviewSchema.parse(content);
    return NextResponse.json({ review: validated });

  } catch (error: any) {
    console.error("Engine failure:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
