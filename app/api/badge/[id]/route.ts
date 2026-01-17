import { NextResponse } from 'next/server';
import { databases, DATABASE_ID, COLLECTION_ID } from '@/lib/appwrite';

export const runtime = 'edge';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    let score = 8;
    try {
      if (DATABASE_ID && COLLECTION_ID) {
        const doc = await databases.getDocument(DATABASE_ID, COLLECTION_ID, id);
        score = doc.score;
      }
    } catch (e) {
      // Fallback
    }

    const getColor = (s: number) => {
      if (s >= 9) return '#10b981'; // Emerald
      if (s >= 7) return '#3b82f6'; // Blue
      if (s >= 5) return '#f59e0b'; // Amber
      return '#ef4444'; // Red
    };

    const color = getColor(score);
    const value = score >= 9 ? 'A+' : score >= 7 ? 'A' : score >= 5 ? 'B' : 'C';

    // Premium Protocol Badge Design
    const svg = `
      <svg width="110" height="20" viewBox="0 0 110 20" xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision">
        <rect width="110" height="20" rx="4" fill="#0a0a0a"/>
        <path d="M0 4C0 1.79086 1.79086 0 4 0H75V20H4C1.79086 20 0 18.2091 0 16V4Z" fill="#1a1a1a"/>
        <path d="M75 0H106C108.209 0 110 1.79086 110 4V16C110 18.2091 108.209 20 106 20H75V0Z" fill="${color}"/>
        <g fill="#fff" font-family="Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-weight="800" font-size="8" letter-spacing="0.1em">
          <text x="37" y="13" text-anchor="middle" opacity="0.5">CO2DE</text>
          <text x="92.5" y="13" text-anchor="middle">${value}</text>
        </g>
      </svg>
    `.trim();

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    return new NextResponse('Error generating badge', { status: 500 });
  }
}
