export const runtime = 'edge';

import { NextResponse } from 'next/server';

/**
 * GEOLOCATION_API_V5
 * Fetches real-time IP-based geolocation data for the client.
 * Uses multiple fallback services for reliability.
 */
export async function GET(request: Request) {
  try {
    // Get client IP from various headers (works on Vercel/Cloudflare/etc)
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const cfConnectingIp = request.headers.get('cf-connecting-ip');
    
    let clientIp = cfConnectingIp || realIp || (forwarded ? forwarded.split(',')[0].trim() : null);
    
    // In development (localhost), fetch public IP from external service
    if (!clientIp || clientIp === '127.0.0.1' || clientIp === '::1' || clientIp.startsWith('192.168.') || clientIp.startsWith('10.')) {
      try {
        // Use ipify to get the public IP
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        if (ipResponse.ok) {
          const ipData = await ipResponse.json();
          clientIp = ipData.ip;
        }
      } catch (e) {
        console.log('Could not fetch public IP, using fallback');
      }
    }
    
    // Try ip-api.com first (free, no API key needed)
    let geoData = null;
    
    if (clientIp && clientIp !== '127.0.0.1' && clientIp !== '::1') {
      try {
        const response = await fetch(`http://ip-api.com/json/${clientIp}?fields=status,country,countryCode,region,regionName,city,lat,lon,timezone,isp,query`);
        if (response.ok) {
          const data = await response.json();
          if (data.status === 'success') {
            geoData = data;
          }
        }
      } catch (e) {
        console.log('ip-api.com failed, trying fallback');
      }
    }
    
    // Fallback: Try ipapi.co (also free, works without IP param for auto-detection)
    if (!geoData) {
      try {
        const response = await fetch('https://ipapi.co/json/');
        if (response.ok) {
          const data = await response.json();
          if (!data.error) {
            geoData = {
              query: data.ip,
              country: data.country_name,
              countryCode: data.country_code,
              regionName: data.region,
              city: data.city,
              lat: data.latitude,
              lon: data.longitude,
              timezone: data.timezone,
              isp: data.org || 'Unknown',
            };
          }
        }
      } catch (e) {
        console.log('ipapi.co failed');
      }
    }
    
    // If still no data, return default
    if (!geoData) {
      return NextResponse.json({
        ip: clientIp || 'unknown',
        country: 'Unknown',
        countryCode: 'XX',
        region: 'europe',
        city: 'Unknown',
        lat: 0,
        lon: 0,
        timezone: 'UTC',
        isp: 'Unknown',
        gridIntensity: 320,
      });
    }
    
    // Map country to our region system
    const regionMapping: Record<string, string> = {
      'US': 'north-america', 'CA': 'north-america', 'MX': 'north-america',
      'GB': 'europe', 'DE': 'europe', 'FR': 'europe', 'IT': 'europe', 'ES': 'europe', 'NL': 'europe', 'BE': 'europe', 'PL': 'europe', 'AT': 'europe', 'CH': 'europe', 'PT': 'europe', 'IE': 'europe', 'GR': 'europe', 'CZ': 'europe', 'RO': 'europe', 'HU': 'europe',
      'CN': 'asia', 'JP': 'asia', 'KR': 'asia', 'IN': 'asia', 'SG': 'asia', 'TH': 'asia', 'VN': 'asia', 'MY': 'asia', 'ID': 'asia', 'PH': 'asia', 'TW': 'asia', 'HK': 'asia', 'BD': 'asia', 'PK': 'asia', 'LK': 'asia', 'NP': 'asia',
      'AU': 'australia', 'NZ': 'australia',
      'NO': 'nordics', 'SE': 'nordics', 'FI': 'nordics', 'DK': 'nordics', 'IS': 'nordics',
    };
    
    const gridIntensityMap: Record<string, number> = {
      'north-america': 450,
      'europe': 320,
      'asia': 580,
      'australia': 620,
      'nordics': 120,
    };
    
    const countryCode = geoData.countryCode || 'XX';
    const region = regionMapping[countryCode] || 'europe';
    
    return NextResponse.json({
      ip: geoData.query || clientIp || 'unknown',
      country: geoData.country,
      countryCode: countryCode,
      region: region,
      city: geoData.city,
      lat: geoData.lat,
      lon: geoData.lon,
      timezone: geoData.timezone,
      isp: geoData.isp || 'Unknown',
      gridIntensity: gridIntensityMap[region] || 320,
    });
    
  } catch (error: any) {
    console.error('Geolocation error:', error);
    return NextResponse.json({
      ip: 'unknown',
      country: 'Unknown',
      countryCode: 'XX',
      region: 'europe',
      city: 'Unknown',
      lat: 0,
      lon: 0,
      timezone: 'UTC',
      isp: 'Unknown',
      gridIntensity: 320,
    });
  }
}
