export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { AIReviewSchema } from '@/lib/schemas';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

/**
 * LARGE_CONTEXT_FREE_MODELS
 * Curated list of high-context, high-performance free models on OpenRouter.
 * 1. DeepSeek R1 (Distill Llama 70B) - Excellent reasoning for architecture.
 * 2. Gemini 2.0 Flash Lite - Ultra-fast, high-token capacity.
 * 3. Phi 3 Medium - Efficient, high-quality small model results.
 */
const FREE_MODELS = [
  "deepseek/deepseek-r1-distill-llama-70b:free",
  "google/gemini-2.0-flash-lite-preview-02-05:free",
  "microsoft/phi-3-medium-128k-instruct:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "google/gemini-2.0-flash-exp:free"
];

async function callAI(code: string, systemPrompt: string, apiKey: string, model: string) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
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
      Identify any heavy or inefficient code dependencies and suggest lighter alternatives.
      Return a JSON object: { 
        "score": number (1-10), 
        "bottleneck": "string", 
        "optimization": "string", 
        "improvement": "string",
        "dependencies": [
          { "name": "string", "impact": "description", "alternative": "suggestion" }
        ]
      }.
      If no significant dependencies are found, return an empty array for dependencies.
      Ensure the score reflects the complexity metrics provided.`;
    }

    if (!OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY is not configured in environment.");
    }

    let content;
    const errors: string[] = [];

    // Fallback Loop Through Large Context Free Models
    for (const model of FREE_MODELS) {
      try {
        content = await callAI(code, systemPrompt, OPENROUTER_API_KEY, model);
        if (content) break; // Success!
      } catch (e: any) {
        errors.push(`${model}: ${e.message}`);
        console.warn(`Model ${model} failed, trying next...`);
        continue;
      }
    }

    if (!content) {
      throw new Error(`All Large-Context Free Models Exhausted: ${errors.join(" | ")}`);
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
