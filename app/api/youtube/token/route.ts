import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'Authorization code is required' }, { status: 400 });
    }

    console.log('Attempting to exchange code for tokens...');
    
    const oauth2Client = new google.auth.OAuth2(
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.NEXT_PUBLIC_REDIRECT_URI
    );

    const { tokens } = await oauth2Client.getToken(code);

    return NextResponse.json({ tokens });
  } catch (error: any) {
    console.error('Error getting tokens:', error);
    
    // Handle specific OAuth errors
    if (error.code === 400 && error.message?.includes('invalid_grant')) {
      return NextResponse.json({ 
        error: 'Authorization code is invalid or has expired. Please try authenticating again.' 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to get tokens',
      details: error.message 
    }, { status: 500 });
  }
} 