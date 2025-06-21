interface ParsedUrl {
  platform: 'spotify' | 'youtube';
  playlistId: string;
  originalUrl: string;
}

interface Track {
  title: string;
  artist: string;
  album?: string;
  duration?: string;
  spotifyUrl?: string;
  youtubeUrl?: string;
}

interface PlaylistData {
  title: string;
  description?: string;
  tracks: Track[];
  platform: 'spotify' | 'youtube';
  originalUrl: string;
}

export function parsePlaylistUrl(url: string): ParsedUrl | null {
  const trimmedUrl = url.trim();
  
  // Spotify playlist URL patterns
  const spotifyPatterns = [
    /spotify\.com\/playlist\/([a-zA-Z0-9]+)/,
    /open\.spotify\.com\/playlist\/([a-zA-Z0-9]+)/
  ];
  
  // YouTube Music playlist URL patterns
  const youtubePatterns = [
    /music\.youtube\.com\/playlist\?list=([a-zA-Z0-9_-]+)/,
    /youtube\.com\/playlist\?list=([a-zA-Z0-9_-]+)/
  ];
  
  // Check Spotify patterns
  for (const pattern of spotifyPatterns) {
    const match = trimmedUrl.match(pattern);
    if (match) {
      return {
        platform: 'spotify',
        playlistId: match[1],
        originalUrl: trimmedUrl
      };
    }
  }
  
  // Check YouTube patterns
  for (const pattern of youtubePatterns) {
    const match = trimmedUrl.match(pattern);
    if (match) {
      return {
        platform: 'youtube',
        playlistId: match[1],
        originalUrl: trimmedUrl
      };
    }
  }
  
  return null;
}

export async function extractPlaylistData(parsedUrl: ParsedUrl): Promise<PlaylistData> {
  // Since we don't have API access, we'll simulate the data extraction
  // In a real implementation, this would make API calls to Spotify/YouTube
  
  if (parsedUrl.platform === 'spotify') {
    return extractSpotifyPlaylist(parsedUrl);
  } else {
    return extractYouTubePlaylist(parsedUrl);
  }
}

async function extractSpotifyPlaylist(parsedUrl: ParsedUrl): Promise<PlaylistData> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Mock data for demonstration
  const mockTracks: Track[] = [
    {
      title: "Blinding Lights",
      artist: "The Weeknd",
      album: "After Hours",
      duration: "3:22"
    },
    {
      title: "Watermelon Sugar",
      artist: "Harry Styles",
      album: "Fine Line",
      duration: "2:54"
    },
    {
      title: "Levitating",
      artist: "Dua Lipa",
      album: "Future Nostalgia",
      duration: "3:23"
    },
    {
      title: "Good 4 U",
      artist: "Olivia Rodrigo",
      album: "SOUR",
      duration: "2:58"
    },
    {
      title: "Industry Baby",
      artist: "Lil Nas X, Jack Harlow",
      album: "MONTERO",
      duration: "3:32"
    }
  ];
  
  return {
    title: "My Awesome Playlist",
    description: "A collection of popular hits",
    tracks: mockTracks,
    platform: 'spotify',
    originalUrl: parsedUrl.originalUrl
  };
}

async function extractYouTubePlaylist(parsedUrl: ParsedUrl): Promise<PlaylistData> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Mock data for demonstration
  const mockTracks: Track[] = [
    {
      title: "As It Was",
      artist: "Harry Styles",
      album: "Harry's House",
      duration: "2:47"
    },
    {
      title: "Heat Waves",
      artist: "Glass Animals",
      album: "Dreamland",
      duration: "3:58"
    },
    {
      title: "Stay",
      artist: "The Kid LAROI, Justin Bieber",
      album: "F*CK LOVE 3: OVER YOU",
      duration: "2:21"
    },
    {
      title: "Bad Habit",
      artist: "Steve Lacy",
      album: "Gemini Rights",
      duration: "3:51"
    },
    {
      title: "About Damn Time",
      artist: "Lizzo",
      album: "Special",
      duration: "3:12"
    }
  ];
  
  return {
    title: "YouTube Music Hits",
    description: "Trending songs on YouTube Music",
    tracks: mockTracks,
    platform: 'youtube',
    originalUrl: parsedUrl.originalUrl
  };
}

// Helper function to format duration from seconds to MM:SS
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Helper function to create search queries for cross-platform searching
export function createSearchQuery(track: Track): string {
  return `${track.title} ${track.artist}`.trim();
} 