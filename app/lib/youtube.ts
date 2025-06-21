import Cookies from 'js-cookie';

interface Track {
  title: string;
  artist: string;
  album?: string;
  duration?: string;
  youtubeVideoId?: string;
}

interface PlaylistData {
  title: string;
  description?: string;
  tracks: Track[];
  platform: 'spotify' | 'youtube';
  originalUrl: string;
}

interface YouTubeAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

class YouTubeClient {
  private config: YouTubeAuthConfig;

  constructor() {
    this.config = {
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      redirectUri: process.env.NEXT_PUBLIC_REDIRECT_URI || 'http://localhost:3000/auth/callback'
    };
  }

  // Generate OAuth URL for user authentication
  async getAuthUrl(): Promise<string> {
    try {
      const response = await fetch('/api/youtube/auth');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get auth URL');
      }
      
      return data.authUrl;
    } catch (error) {
      console.error('Error getting auth URL:', error);
      throw new Error('Failed to get auth URL');
    }
  }

  // Exchange authorization code for tokens
  async getTokens(code: string): Promise<any> {
    try {
      const response = await fetch('/api/youtube/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get tokens');
      }

      const { tokens } = data;
      
      // Store tokens in cookies (secure, httpOnly in production)
      Cookies.set('youtube_access_token', tokens.access_token!, {
        expires: 1, // 1 day
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      if (tokens.refresh_token) {
        Cookies.set('youtube_refresh_token', tokens.refresh_token, {
          expires: 30, // 30 days
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });
      }

      return tokens;
    } catch (error) {
      console.error('Error getting tokens:', error);
      throw new Error('Failed to authenticate with YouTube');
    }
  }

  // Load tokens from cookies
  loadTokensFromCookies(): boolean {
    const accessToken = Cookies.get('youtube_access_token');
    return !!accessToken;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!Cookies.get('youtube_access_token');
  }

  // Logout - clear tokens
  logout(): void {
    Cookies.remove('youtube_access_token');
    Cookies.remove('youtube_refresh_token');
  }



  // Convert Spotify playlist to YouTube Music
  async convertSpotifyPlaylist(
    playlistData: PlaylistData,
    onProgress?: (current: number, total: number, trackTitle: string) => void
  ): Promise<{ playlistId: string; addedTracks: number; failedTracks: string[] }> {
    if (!this.isAuthenticated()) {
      throw new Error('User not authenticated with YouTube');
    }

    try {
      const accessToken = Cookies.get('youtube_access_token');
      
      if (!accessToken) {
        throw new Error('Access token not found');
      }

      const response = await fetch('/api/youtube/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playlistData,
          accessToken
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to convert playlist');
      }

      return {
        playlistId: data.playlistId,
        addedTracks: data.addedTracks,
        failedTracks: data.failedTracks
      };
    } catch (error) {
      console.error('Error converting playlist:', error);
      throw new Error('Failed to convert playlist to YouTube Music');
    }
  }

  // Get playlist URL
  getPlaylistUrl(playlistId: string): string {
    return `https://music.youtube.com/playlist?list=${playlistId}`;
  }
}

export default YouTubeClient; 