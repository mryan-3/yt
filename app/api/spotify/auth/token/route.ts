import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'Authorization code is required' }, { status: 400 });
    }

    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      return NextResponse.json({ error: 'Spotify credentials not configured' }, { status: 500 });
    }

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Spotify token error:', data);
      
      if (data.error === 'invalid_grant') {
        return NextResponse.json({ 
          error: 'Authorization code is invalid or has expired. Please try authenticating again.' 
        }, { status: 400 });
      }
      
      throw new Error(data.error_description || 'Failed to get Spotify tokens');
    }

    return NextResponse.json({ tokens: data });
  } catch (error: any) {
    console.error('Error getting Spotify tokens:', error);
    
    return NextResponse.json({ 
      error: 'Failed to get tokens',
      details: error.message 
    }, { status: 500 });
  }
} 