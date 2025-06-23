"use client";

import { useState, useEffect } from "react";
import { parsePlaylistUrl } from "../lib/playlistParser";
import SpotifyClient from "../lib/spotify";
import YouTubeClient from "../lib/youtube";
import TransferChamber from "./TransferChamber";

interface Track {
  title: string;
  artist: string;
  album?: string;
  duration?: string;
  spotifyUrl?: string;
  youtubeUrl?: string;
  popularity?: number;
  genre?: string;
}

interface PlaylistData {
  title: string;
  description?: string;
  tracks: Track[];
  platform: 'spotify' | 'youtube';
  originalUrl: string;
}

export default function EpicPlaylistConverter() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [playlistData, setPlaylistData] = useState<PlaylistData | null>(null);
  const [error, setError] = useState("");
  const [converting, setConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState<{
    current: number;
    total: number;
    trackTitle: string;
  } | null>(null);
  const [conversionResult, setConversionResult] = useState<{
    playlistUrl: string;
    addedTracks: number;
    failedTracks: string[];
  } | null>(null);
  const [showChamber, setShowChamber] = useState(false);
  
  const [youtubeClient] = useState(() => new YouTubeClient());
  const [spotifyClient] = useState(() => new SpotifyClient());
  const [isYouTubeAuthenticated, setIsYouTubeAuthenticated] = useState(false);
  const [isSpotifyAuthenticated, setIsSpotifyAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated with both platforms
    setIsYouTubeAuthenticated(youtubeClient.isAuthenticated());
    setIsSpotifyAuthenticated(spotifyClient.isAuthenticated());
    
    // Handle auth codes from callback
    const youtubeAuthCode = localStorage.getItem('youtube_auth_code');
    const spotifyAuthCode = localStorage.getItem('spotify_auth_code');
    
    if (youtubeAuthCode) {
      youtubeClient.getTokens(youtubeAuthCode).then(() => {
        setIsYouTubeAuthenticated(true);
        localStorage.removeItem('youtube_auth_code');
      }).catch(console.error);
    }

    if (spotifyAuthCode) {
      spotifyClient.getTokens(spotifyAuthCode).then(() => {
        setIsSpotifyAuthenticated(true);
        localStorage.removeItem('spotify_auth_code');
      }).catch(console.error);
    }
  }, [youtubeClient, spotifyClient]);

  const handleConvert = async () => {
    if (!url.trim()) {
      setError("Please enter a valid playlist URL");
      return;
    }

    setLoading(true);
    setError("");
    setPlaylistData(null);
    setConversionResult(null);

    try {
      const parsedUrl = parsePlaylistUrl(url);
      if (!parsedUrl) {
        throw new Error("Invalid playlist URL. Please enter a valid Spotify or YouTube Music playlist URL.");
      }

      let data: PlaylistData;
      
      if (parsedUrl.platform === 'spotify') {
        const spotifyData = await spotifyClient.getPlaylist(parsedUrl.playlistId);
        data = {
          ...spotifyData,
          tracks: spotifyData.tracks.map((track: any) => ({
            ...track,
            popularity: Math.floor(Math.random() * 50) + 50, // Mock popularity
            genre: getGenreFromTrack(track) // Extract genre
          }))
        };
      } else {
        // YouTube playlist
        if (!isYouTubeAuthenticated) {
          throw new Error("Please authenticate with YouTube Music first to read playlists.");
        }
        const youtubeData = await youtubeClient.getPlaylist(parsedUrl.playlistId);
        data = {
          ...youtubeData,
          tracks: youtubeData.tracks.map((track: any) => ({
            ...track,
            popularity: Math.floor(Math.random() * 50) + 50, // Mock popularity  
            genre: getGenreFromTrack(track) // Extract genre
          }))
        };
      }
      
      setPlaylistData(data);
      setShowChamber(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to convert playlist");
    } finally {
      setLoading(false);
    }
  };

  // Simple genre detection based on track/artist names
  const getGenreFromTrack = (track: any): string => {
    const title = track.title?.toLowerCase() || '';
    const artist = track.artist?.toLowerCase() || '';
    const combined = `${title} ${artist}`;
    
    if (combined.includes('rock') || artist.includes('queen') || artist.includes('led zeppelin')) {
      return 'rock';
    } else if (combined.includes('pop') || artist.includes('taylor swift') || artist.includes('ariana')) {
      return 'pop';
    } else if (combined.includes('hip hop') || combined.includes('rap') || artist.includes('eminem')) {
      return 'hip-hop';
    } else if (combined.includes('electronic') || combined.includes('edm') || artist.includes('daft punk')) {
      return 'electronic';
    } else if (combined.includes('jazz') || artist.includes('miles davis')) {
      return 'jazz';
    } else if (combined.includes('classical') || artist.includes('beethoven')) {
      return 'classical';
    } else if (combined.includes('country') || artist.includes('johnny cash')) {
      return 'country';
    }
    return 'default';
  };

  const handleAuth = async (platform: 'spotify' | 'youtube') => {
    try {
      const authUrl = platform === 'spotify' 
        ? await spotifyClient.getAuthUrl()
        : await youtubeClient.getAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      setError(`Failed to initiate ${platform} authentication`);
    }
  };

  const handleAutoConvert = async () => {
    if (!playlistData) return;

    // Check authentication based on target platform
    const targetPlatform = playlistData.platform === 'spotify' ? 'youtube' : 'spotify';
    
    if (targetPlatform === 'youtube' && !isYouTubeAuthenticated) {
      setError('Please authenticate with YouTube Music first');
      return;
    }
    
    if (targetPlatform === 'spotify' && !isSpotifyAuthenticated) {
      setError('Please authenticate with Spotify first');
      return;
    }

    setConverting(true);
    setConversionProgress(null);
    setError("");

    try {
      let result;
      let playlistUrl;

      if (playlistData.platform === 'spotify') {
        // Convert Spotify to YouTube Music
        result = await youtubeClient.convertSpotifyPlaylist(
          playlistData,
          (current: number, total: number, trackTitle: string) => {
            setConversionProgress({ current, total, trackTitle });
          }
        );
        playlistUrl = youtubeClient.getPlaylistUrl(result.playlistId);
      } else {
        // Convert YouTube Music to Spotify
        result = await spotifyClient.convertYouTubePlaylist(
          playlistData,
          (current: number, total: number, trackTitle: string) => {
            setConversionProgress({ current, total, trackTitle });
          }
        );
        playlistUrl = spotifyClient.getPlaylistUrl(result.playlistId);
      }

      setConversionResult({
        playlistUrl,
        addedTracks: result.addedTracks,
        failedTracks: result.failedTracks
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to convert playlist");
    } finally {
      setConverting(false);
      setConversionProgress(null);
    }
  };

  const handleBackToInput = () => {
    setShowChamber(false);
    setPlaylistData(null);
    setConversionResult(null);
    setError("");
  };

  // Show Transfer Chamber if we have playlist data
  if (showChamber && playlistData) {
    return (
      <TransferChamber
        playlistData={playlistData}
        isSpotifyAuthenticated={isSpotifyAuthenticated}
        isYouTubeAuthenticated={isYouTubeAuthenticated}
        isConverting={converting}
        conversionProgress={conversionProgress || undefined}
        onSpotifyConnect={() => handleAuth('spotify')}
        onYouTubeConnect={() => handleAuth('youtube')}
        onStartConversion={handleAutoConvert}
      />
    );
  }

  // URL Input Interface
  return (
    <div className="min-h-screen bg-transparent relative">
      {/* Input Portal */}
      <div className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="max-w-2xl mx-auto px-6">
          <div className="bg-black/60 border border-cyan-400/30 rounded-xl p-8 backdrop-blur-lg">
            <div className="text-center mb-8">
              <h2 className="font-heading text-3xl font-bold text-white text-glow mb-4">
                PLAYLIST MOLECULAR SCANNER
              </h2>
              <p className="text-gray-300 font-body">
                Enter playlist URL to begin DNA extraction sequence
              </p>
            </div>

            {/* URL Input */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 font-heading">
                  PLAYLIST URL
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://open.spotify.com/playlist/... or https://music.youtube.com/playlist?list=..."
                  className="w-full p-3 bg-black/40 border border-cyan-400/50 rounded-lg text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 font-body"
                  disabled={loading}
                />
              </div>

              <button
                onClick={handleConvert}
                disabled={loading || !url.trim()}
                className={`
                  w-full py-3 px-6 rounded-lg font-heading font-bold text-lg transition-all duration-300
                  ${loading || !url.trim()
                    ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-500 glow-energy'
                  }
                `}
              >
                {loading ? 'SCANNING MOLECULAR STRUCTURE...' : 'INITIATE SCAN'}
              </button>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mt-4 p-4 bg-red-900/30 border border-red-400/50 rounded-lg">
                <p className="text-red-400 font-body text-sm">{error}</p>
              </div>
            )}

            {/* Auth Status */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className={`p-3 rounded-lg border ${isSpotifyAuthenticated ? 'bg-green-900/30 border-green-400/50' : 'bg-gray-900/30 border-gray-600/50'}`}>
                <div className="text-center">
                  <div className="text-2xl mb-2">♫</div>
                  <div className={`font-heading text-sm ${isSpotifyAuthenticated ? 'text-green-400' : 'text-gray-400'}`}>
                    SPOTIFY {isSpotifyAuthenticated ? 'CONNECTED' : 'OFFLINE'}
                  </div>
                  {!isSpotifyAuthenticated && (
                    <button
                      onClick={() => handleAuth('spotify')}
                      className="mt-2 px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-500 transition-colors"
                    >
                      CONNECT
                    </button>
                  )}
                </div>
              </div>

              <div className={`p-3 rounded-lg border ${isYouTubeAuthenticated ? 'bg-green-900/30 border-green-400/50' : 'bg-gray-900/30 border-gray-600/50'}`}>
                <div className="text-center">
                  <div className="text-2xl mb-2">▶</div>
                  <div className={`font-heading text-sm ${isYouTubeAuthenticated ? 'text-green-400' : 'text-gray-400'}`}>
                    YOUTUBE {isYouTubeAuthenticated ? 'CONNECTED' : 'OFFLINE'}
                  </div>
                  {!isYouTubeAuthenticated && (
                    <button
                      onClick={() => handleAuth('youtube')}
                      className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-500 transition-colors"
                    >
                      CONNECT
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-6 p-4 bg-cyan-900/20 border border-cyan-400/30 rounded-lg">
              <h4 className="font-heading text-cyan-400 font-semibold mb-2 text-sm">
                SCANNING PROTOCOL:
              </h4>
              <ul className="text-gray-300 text-xs space-y-1 font-body">
                <li>• Paste Spotify or YouTube Music playlist URL</li>
                <li>• Ensure both platforms are authenticated for conversion</li>
                <li>• Initiate scan to enter Transfer Chamber</li>
                <li>• Watch molecular DNA extraction in real-time</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Animation */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4"></div>
            <div className="text-cyan-400 font-heading">ANALYZING MOLECULAR STRUCTURE...</div>
          </div>
        </div>
      )}

      {/* Success Result */}
      {conversionResult && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-black/90 border border-green-400/50 rounded-xl p-8 max-w-md">
            <div className="text-center">
              <div className="text-4xl mb-4">🎉</div>
              <h3 className="font-heading text-xl text-green-400 mb-4">
                TRANSFER COMPLETE!
              </h3>
              <p className="text-gray-300 mb-4 font-body">
                {conversionResult.addedTracks} tracks successfully transferred
              </p>
              <a
                href={conversionResult.playlistUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg font-heading font-semibold hover:from-green-500 hover:to-blue-500 transition-all duration-300 mb-4"
              >
                VIEW PLAYLIST
              </a>
              <div>
                <button
                  onClick={handleBackToInput}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors font-body"
                >
                  Transfer Another Playlist
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 