export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { AIReviewSchema } from '@/lib/schemas';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

/**
 * LARGE_CONTEXT_FREE_MODELS_V5
 * Curated list of high-context, high-performance free models on OpenRouter.
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
      "X-Title": "CO2DE Audit Engine v5",
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
      4. Replacing heavy dependencies with native alternatives.
      Return ONLY a JSON object: { "refactoredCode": "string", "explanation": "string" }.`;
    } else {
      const context = metrics ? `\n\nMetric Context: Big_O=${metrics.complexity}, Mem_Pressure=${metrics.memPressure}, Lines=${metrics.lineCount}, Language=${metrics.language}` : "";
      systemPrompt = `You are an Elite Green Software Auditor with deep expertise in sustainable computing. 
      Analyze the provided code comprehensively. ${context}
      
      Your analysis MUST include:
      1. SUMMARY: A clear, technical explanation of what this code does (2-3 sentences).
      2. SCORE: Rate efficiency 1-10 based on algorithmic complexity, memory usage, and energy patterns.
      3. BOTTLENECK: Identify the single most impactful performance bottleneck.
      4. OPTIMIZATION: Provide a specific, actionable optimization strategy.
      5. IMPROVEMENT: Quantify potential efficiency gains.
      6. DEPENDENCIES: Detect ALL imported packages/libraries. For each:
         - name: The package name (e.g., "lodash", "moment", "axios")
         - impact: How it affects bundle size and runtime performance
         - alternative: A lighter, more efficient alternative
         - severity: "low" | "medium" | "high" | "critical"
         - bundleSizeKb: Estimated bundle size contribution (number)
         - category: "runtime" | "devtool" | "utility" | "framework" | "polyfill"
      7. HOTSPOTS: Identify specific lines or patterns that are inefficient:
         - description: What the issue is
         - severity: "info" | "warning" | "critical"
      8. SECURITY_NOTES: Any security concerns related to dependencies or patterns.
      
      Return a JSON object with this exact structure:
      {
        "score": number,
        "summary": "string",
        "bottleneck": "string",
        "optimization": "string",
        "improvement": "string",
        "dependencies": [{ "name": "string", "impact": "string", "alternative": "string", "severity": "low|medium|high|critical", "bundleSizeKb": number, "category": "runtime|devtool|utility|framework|polyfill" }],
        "hotspots": [{ "description": "string", "severity": "info|warning|critical" }],
        "securityNotes": "string or null"
      }
      
      If no dependencies are detected, return an empty array.
      Be thorough - analyze import statements, require calls, and any external module references.`;
    }

    if (!OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY is not configured in environment.");
    }

    let content;
    const errors: string[] = [];

    for (const model of FREE_MODELS) {
      try {
        content = await callAI(code, systemPrompt, OPENROUTER_API_KEY, model);
        if (content) break;
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
