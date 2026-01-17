import { NextResponse } from 'next/server';
import { AIReviewSchema } from '@/lib/schemas';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export async function POST(request: Request) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'No code provided' }, { status: 400 });
    }

    // Fallback if no API key is provided
    if (!OPENROUTER_API_KEY) {
      return NextResponse.json({ error: 'OpenRouter API key not configured' }, { status: 500 });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://co2de.vercel.app", // Optional
        "X-Title": "CO2DE", // Optional
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-exp:free", // Using a free/fast model for hackathon
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
            content: `Analyze this code:\n\n${code.substring(0, 10000)}` // Limit length for token safety
          }
        ],
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    const content = data.choices[0].message.content;
    const review = JSON.parse(content);

    // Validate with Zod
    const validatedReview = AIReviewSchema.parse(review);

    return NextResponse.json({ review: validatedReview });
  } catch (error) {
    console.error('AI Analysis Error:', error);
    return NextResponse.json({ error: 'Failed to generate AI review' }, { status: 500 });
  }
}
