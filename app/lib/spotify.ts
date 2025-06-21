interface SpotifyTrack {
  name: string;
  artists: Array<{ name: string }>;
  album: { name: string };
  duration_ms: number;
  external_urls: { spotify: string };
}

interface SpotifyPlaylist {
  name: string;
  description: string;
  tracks: {
    items: Array<{ track: SpotifyTrack }>;
  };
  external_urls: { spotify: string };
}

interface Track {
  title: string;
  artist: string;
  album?: string;
  duration?: string;
  spotifyUrl?: string;
}

interface PlaylistData {
  title: string;
  description?: string;
  tracks: Track[];
  platform: 'spotify' | 'youtube';
  originalUrl: string;
}

class SpotifyClient {
  private clientId: string;
  private clientSecret: string;
  private accessToken: string | null = null;

  constructor() {
    // These would typically come from environment variables
    // For demo purposes, we'll use public API approach
    this.clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || '';
    this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET || '';
  }

  async getAccessToken(): Promise<string> {
    if (this.accessToken) {
      return this.accessToken;
    }

    try {
      const response = await fetch('/api/spotify/token');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get Spotify token');
      }
      
      this.accessToken = data.access_token;
      
      // Set token expiry (default to 1 hour)
      setTimeout(() => {
        this.accessToken = null;
      }, 3500 * 1000); // 58 minutes

      return this.accessToken!;
    } catch (error) {
      console.error('Failed to get Spotify access token:', error);
      throw new Error('Failed to authenticate with Spotify');
    }
  }

  async getPlaylist(playlistId: string): Promise<PlaylistData> {
    const token = await this.getAccessToken();
    
    try {
      const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Spotify API error: ${response.status}`);
      }

      const playlist: SpotifyPlaylist = await response.json();
      
      const tracks: Track[] = playlist.tracks.items.map(item => ({
        title: item.track.name,
        artist: item.track.artists.map(artist => artist.name).join(', '),
        album: item.track.album.name,
        duration: this.formatDuration(item.track.duration_ms),
        spotifyUrl: item.track.external_urls.spotify
      }));

      return {
        title: playlist.name,
        description: playlist.description || '',
        tracks,
        platform: 'spotify',
        originalUrl: playlist.external_urls.spotify
      };
    } catch (error) {
      console.error('Failed to fetch Spotify playlist:', error);
      throw new Error('Failed to fetch playlist from Spotify');
    }
  }

  private formatDuration(durationMs: number): string {
    const totalSeconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}

export default SpotifyClient; 