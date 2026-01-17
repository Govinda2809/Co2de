import { NextResponse } from 'next/server';
import { AIReviewSchema } from '@/lib/schemas';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MULEROUTER_API_KEY = process.env.MULEROUTER_API_KEY;

export async function POST(request: Request) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'No code provided' }, { status: 400 });
    }

    // Heuristic: Try OpenRouter, then fallback to MuleRouter
    let review;
    let errorDetails = "";

    // 1. TRY OPENROUTER
    if (OPENROUTER_API_KEY) {
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://co2de.vercel.app",
            "X-Title": "CO2DE",
          },
          body: JSON.stringify({
            model: "google/gemini-2.0-flash-exp:free",
            messages: [
              {
                role: "system",
                content: `You are a Green Software Engineering expert. Analyze the provided code for environmental impact and energy efficiency. 
                Return ONLY a valid JSON object with the following fields:
                - score: (number between 1-10, where 10 is most efficient)
                - bottleneck: (string, the main energy-consuming pattern found)
                - optimization: (string, specific actionable advice to reduce carbon footprint)
                - improvement: (string, estimated percentage decrease in energy usage if optimized)`
              },
              {
                role: "user",
                content: `Analyze this code:\n\n${code.substring(0, 10000)}`
              }
            ],
            response_format: { type: "json_object" }
          })
        });

        if (response.ok) {
          const data = await response.json();
          review = JSON.parse(data.choices[0].message.content);
        } else {
          errorDetails += `OpenRouter failed: ${response.statusText}. `;
        }
      } catch (e) {
        errorDetails += `OpenRouter error: ${e instanceof Error ? e.message : 'Unknown'}. `;
      }
    } else {
      errorDetails += "OpenRouter API key missing. ";
    }

    // 2. FALLBACK TO MULEROUTER
    if (!review && MULEROUTER_API_KEY) {
      console.warn("OpenRouter failed, attempting fallback to MuleRouter...");
      try {
        const response = await fetch("https://api.mulerouter.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${MULEROUTER_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.0-flash", // MuleRouter compatible model mapping
            messages: [
              {
                role: "system",
                content: `You are a Green Software Engineering expert. Analyze the provided code for environmental impact and energy efficiency. 
                Return ONLY a valid JSON object with the following fields:
                - score: (number between 1-10, where 10 is most efficient)
                - bottleneck: (string, the main energy-consuming pattern found)
                - optimization: (string, specific actionable advice to reduce carbon footprint)
                - improvement: (string, estimated percentage decrease in energy usage if optimized)`
              },
              {
                role: "user",
                content: `Analyze this code:\n\n${code.substring(0, 10000)}`
              }
            ],
            response_format: { type: "json_object" }
          })
        });

        if (response.ok) {
          const data = await response.json();
          review = JSON.parse(data.choices[0].message.content);
        } else {
          errorDetails += `MuleRouter failed: ${response.statusText}. `;
        }
      } catch (e) {
        errorDetails += `MuleRouter error: ${e instanceof Error ? e.message : 'Unknown'}. `;
      }
    }

    if (!review) {
      return NextResponse.json({ 
        error: 'All AI Providers failed', 
        details: errorDetails 
      }, { status: 502 });
    }

    // Validate with Zod
    const validatedReview = AIReviewSchema.parse(review);
    return NextResponse.json({ review: validatedReview });

  } catch (error) {
    console.error('AI Analysis Route Exception:', error);
    return NextResponse.json({ error: 'Failed to process AI analysis' }, { status: 500 });
  }
}
