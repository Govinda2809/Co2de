export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { AIReviewSchema } from '@/lib/schemas';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MULEROUTER_API_KEY = process.env.MULEROUTER_API_KEY;

/**
 * LARGE_CONTEXT_FREE_MODELS_V5
 * Curated list of high-context, high-performance free models on OpenRouter.
 */
const OPENROUTER_MODELS = [
  "deepseek/deepseek-r1-distill-llama-70b:free",
  "google/gemini-2.0-flash-lite-preview-02-05:free",
  "microsoft/phi-3-medium-128k-instruct:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "google/gemini-2.0-flash-exp:free"
];

/**
 * MULEROUTER FALLBACK MODELS
 * Models available on MuleRouter as fallback.
 */
const MULEROUTER_MODELS = [
  "deepseek/deepseek-r1",
  "meta-llama/llama-3.3-70b-instruct",
  "google/gemini-2.0-flash"
];

type RouterType = 'openrouter' | 'mulerouter';

interface RouterConfig {
  baseUrl: string;
  apiKey: string | undefined;
  models: string[];
  referer: string;
  title: string;
}

const ROUTER_CONFIGS: Record<RouterType, RouterConfig> = {
  openrouter: {
    baseUrl: "https://openrouter.ai/api/v1/chat/completions",
    apiKey: OPENROUTER_API_KEY,
    models: OPENROUTER_MODELS,
    referer: "https://co2de.dev",
    title: "CO2DE Audit Engine v5"
  },
  mulerouter: {
    baseUrl: "https://api.mulerouter.ai/v1/chat/completions",
    apiKey: MULEROUTER_API_KEY,
    models: MULEROUTER_MODELS,
    referer: "https://co2de.dev",
    title: "CO2DE Audit Engine v5 [Fallback]"
  }
};

async function callAI(
  code: string, 
  systemPrompt: string, 
  router: RouterType, 
  model: string
) {
  const config = ROUTER_CONFIGS[router];
  
  if (!config.apiKey) {
    throw new Error(`${router.toUpperCase()}_API_KEY is not configured.`);
  }

  const response = await fetch(config.baseUrl, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": config.referer,
      "X-Title": config.title,
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
    throw new Error(`${router} error (${response.status}): ${errorText}`);
  }
  
  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  
  if (!content) throw new Error(`${router} returned null response content.`);
  
  try {
    return JSON.parse(content);
  } catch (e) {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    throw new Error(`Failed to parse ${router} response as JSON.`);
  }
}

async function tryRouter(
  code: string, 
  systemPrompt: string, 
  router: RouterType
): Promise<{ content: any; router: RouterType; model: string } | null> {
  const config = ROUTER_CONFIGS[router];
  
  if (!config.apiKey) {
    console.warn(`${router} API key not configured, skipping...`);
    return null;
  }

  for (const model of config.models) {
    try {
      const content = await callAI(code, systemPrompt, router, model);
      if (content) {
        console.log(`✓ Success with ${router}/${model}`);
        return { content, router, model };
      }
    } catch (e: any) {
      console.warn(`${router}/${model} failed: ${e.message}`);
      continue;
    }
  }
  
  return null;
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

    // Check if at least one router is configured
    if (!OPENROUTER_API_KEY && !MULEROUTER_API_KEY) {
      throw new Error("No AI router configured. Set OPENROUTER_API_KEY or MULEROUTER_API_KEY.");
    }

    let result: { content: any; router: RouterType; model: string } | null = null;

    // Try OpenRouter first (primary)
    if (OPENROUTER_API_KEY) {
      result = await tryRouter(code, systemPrompt, 'openrouter');
    }

    // Fallback to MuleRouter if OpenRouter failed
    if (!result && MULEROUTER_API_KEY) {
      console.log("⟳ OpenRouter exhausted, falling back to MuleRouter...");
      result = await tryRouter(code, systemPrompt, 'mulerouter');
    }

    if (!result) {
      throw new Error("All AI routers exhausted. Both OpenRouter and MuleRouter failed.");
    }

    const { content, router, model } = result;

    if (mode === 'refactor') {
      return NextResponse.json({ 
        refactoredCode: content.refactoredCode || code, 
        explanation: content.explanation || "Optimization complete with heuristic defaults.",
        _meta: { router, model }
      });
    }

    const validated = AIReviewSchema.parse(content);
    return NextResponse.json({ 
      review: validated,
      _meta: { router, model }
    });

  } catch (error: any) {
    console.error("Engine failure:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
