import { NextResponse } from 'next/server';
import { databases, DATABASE_ID, COLLECTION_ID } from '@/lib/appwrite';

export const runtime = 'edge';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    // In a real edge environment with Appwrite, we'd need a server-side client or public read
    // For this implementation, we'll return a dynamic SVG based on the project's reported score
    
    // We try to fetch the document to get the real score
    // Note: This requires the collection to have 'Any' read permissions or an API Key
    let score = 8; // Default
    try {
      const doc = await databases.getDocument(DATABASE_ID, COLLECTION_ID, id);
      score = doc.score;
    } catch (e) {
      // Fallback to a generic badge if ID is not found
    }

    const getColor = (s: number) => {
      if (s >= 8) return '#10b981'; // Emerald
      if (s >= 6) return '#f59e0b'; // Amber
      return '#ef4444'; // Red
    };

    const color = getColor(score);
    const label = "CO2DE GRADE";
    const value = score >= 8 ? 'A+' : score >= 6 ? 'B' : 'C';

    const svg = `
      <svg width="120" height="20" viewBox="0 0 120 20" xmlns="http://www.w3.org/2000/svg">
        <linearGradient id="g" x2="0" y2="100%">
          <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
          <stop offset="1" stop-opacity=".1"/>
        </linearGradient>
        <clipPath id="r">
          <rect width="120" height="20" rx="3" fill="#fff"/>
        </clipPath>
        <g clip-path="url(#r)">
          <rect width="85" height="20" fill="#555"/>
          <rect x="85" width="35" height="20" fill="${color}"/>
          <rect width="120" height="20" fill="url(#g)"/>
        </g>
        <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="110">
          <text x="435" y="140" transform="scale(.1)" textLength="750">${label}</text>
          <text x="1025" y="140" transform="scale(.1)" font-weight="bold" textLength="250">${value}</text>
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
