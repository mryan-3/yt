"use client";

import { useState, useEffect } from "react";
import { Loader2, ExternalLink, Music, Search, Copy, CheckCircle, Youtube, Shield, Zap } from "lucide-react";
import { parsePlaylistUrl } from "../lib/playlistParser";
import SpotifyClient from "../lib/spotify";
import YouTubeClient from "../lib/youtube";
import TrackList from "./TrackList";

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

export default function PlaylistConverter() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [playlistData, setPlaylistData] = useState<PlaylistData | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
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

      if (parsedUrl.platform === 'spotify') {
        const data = await spotifyClient.getPlaylist(parsedUrl.playlistId);
        setPlaylistData(data);
      } else {
        // YouTube playlist
        if (!isYouTubeAuthenticated) {
          throw new Error("Please authenticate with YouTube Music first to read playlists.");
        }
        const data = await youtubeClient.getPlaylist(parsedUrl.playlistId);
        setPlaylistData(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to convert playlist");
    } finally {
      setLoading(false);
    }
  };

  const handleCopySearchTerms = () => {
    if (!playlistData) return;
    
    const searchTerms = playlistData.tracks
      .map(track => `${track.title} ${track.artist}`)
      .join('\n');
    
    navigator.clipboard.writeText(searchTerms);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleYouTubeAuth = async () => {
    try {
      const authUrl = await youtubeClient.getAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      setError('Failed to initiate YouTube authentication');
    }
  };

  const handleSpotifyAuth = async () => {
    try {
      const authUrl = await spotifyClient.getAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      setError('Failed to initiate Spotify authentication');
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
          (current, total, trackTitle) => {
            setConversionProgress({ current, total, trackTitle });
          }
        );
        playlistUrl = youtubeClient.getPlaylistUrl(result.playlistId);
      } else {
        // Convert YouTube Music to Spotify
        result = await spotifyClient.convertYouTubePlaylist(
        playlistData,
        (current, total, trackTitle) => {
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

  const targetPlatform = playlistData?.platform === 'spotify' ? 'YouTube Music' : 'Spotify';
  const targetPlatformColor = playlistData?.platform === 'spotify' ? 'red' : 'green';
  const isTargetAuthenticated = playlistData?.platform === 'spotify' ? isYouTubeAuthenticated : isSpotifyAuthenticated;

  return (
    <div className="space-y-8">
      {/* URL Input Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Enter Playlist URL
        </h3>
        
        <div className="space-y-4">
          <div>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste your Spotify or YouTube Music playlist URL here..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              disabled={loading}
            />
          </div>
          
          <button
            onClick={handleConvert}
            disabled={loading || !url.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Extracting playlist data...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Convert Playlist
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Results Section */}
      {playlistData && (
        <div className="space-y-6">
          {/* Playlist Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {playlistData.title}
                </h3>
                {playlistData.description && (
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    {playlistData.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>{playlistData.tracks.length} tracks</span>
                  <span>From {playlistData.platform === 'spotify' ? 'Spotify' : 'YouTube Music'}</span>
                </div>
              </div>
              <a
                href={playlistData.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                <ExternalLink className="w-4 h-4" />
                View Original
              </a>
            </div>

            {/* Auto-Convert Section */}
            <div className={`p-4 rounded-lg border ${
              targetPlatformColor === 'red' 
                ? 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800' 
                : 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800'
            }`}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                  <h4 className={`font-medium mb-1 flex items-center gap-2 ${
                    targetPlatformColor === 'red' 
                      ? 'text-red-800 dark:text-red-300' 
                      : 'text-green-800 dark:text-green-300'
                  }`}>
                      <Zap className="w-4 h-4" />
                    Auto-Convert to {targetPlatform}
                    </h4>
                  <p className={`text-sm ${
                    targetPlatformColor === 'red' 
                      ? 'text-red-600 dark:text-red-400' 
                      : 'text-green-600 dark:text-green-400'
                  }`}>
                    Automatically create this playlist in your {targetPlatform} account
                    </p>
                  </div>
                </div>

              {!isTargetAuthenticated ? (
                  <div className="space-y-3">
                  <div className={`flex items-center gap-2 text-sm ${
                    targetPlatformColor === 'red' 
                      ? 'text-red-700 dark:text-red-400' 
                      : 'text-green-700 dark:text-green-400'
                  }`}>
                      <Shield className="w-4 h-4" />
                    You need to connect your {targetPlatform} account first
                    </div>
                    <button
                    onClick={targetPlatform === 'YouTube Music' ? handleYouTubeAuth : handleSpotifyAuth}
                    className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors text-sm ${
                      targetPlatformColor === 'red' 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {targetPlatform === 'YouTube Music' ? (
                      <Youtube className="w-4 h-4" />
                    ) : (
                      <Music className="w-4 h-4" />
                    )}
                    Connect {targetPlatform}
                    </button>
                  </div>
                ) : (
                <div className="space-y-3">
                  <div className={`flex items-center gap-2 text-sm ${
                    targetPlatformColor === 'red' 
                      ? 'text-red-700 dark:text-red-400' 
                      : 'text-green-700 dark:text-green-400'
                  }`}>
                      <CheckCircle className="w-4 h-4" />
                    Connected to {targetPlatform}
                    </div>
                    <button
                      onClick={handleAutoConvert}
                      disabled={converting}
                    className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors text-sm disabled:opacity-50 ${
                      targetPlatformColor === 'red' 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                    >
                      {converting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Converting...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                        Auto-Convert Playlist
                        </>
                      )}
                    </button>
                  </div>
                )}
          </div>

          {/* Conversion Progress */}
          {conversionProgress && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3 mb-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                    Converting playlist... ({conversionProgress.current}/{conversionProgress.total})
                  </span>
                </div>
                <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2 mb-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(conversionProgress.current / conversionProgress.total) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Currently processing: {conversionProgress.trackTitle}
                </p>
            </div>
          )}

          {/* Conversion Result */}
          {conversionResult && (
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h4 className="font-medium text-green-800 dark:text-green-300">
                    Playlist converted successfully!
                    </h4>
                  </div>
                  
                <div className="text-sm text-green-700 dark:text-green-400 mb-4">
                  <p>✅ Successfully added {conversionResult.addedTracks} tracks</p>
                  {conversionResult.failedTracks.length > 0 && (
                    <p>⚠️ {conversionResult.failedTracks.length} tracks could not be found</p>
                  )}
                </div>

                <a
                  href={conversionResult.playlistUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 px-6 py-3 text-white rounded-lg transition-colors font-medium ${
                    targetPlatformColor === 'red' 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {targetPlatform === 'YouTube Music' ? (
                  <Youtube className="w-5 h-5" />
                  ) : (
                    <Music className="w-5 h-5" />
                  )}
                  Open Playlist in {targetPlatform}
                  <ExternalLink className="w-4 h-4" />
                </a>

                {conversionResult.failedTracks.length > 0 && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">
                      View tracks that could not be found ({conversionResult.failedTracks.length})
                    </summary>
                    <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded text-sm">
                      <ul className="space-y-1">
                        {conversionResult.failedTracks.map((track, index) => (
                          <li key={index} className="text-gray-600 dark:text-gray-400">
                            • {track}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </details>
                )}
              </div>
            )}

            {/* Manual Copy Section */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Manual Search Option
                </h4>
                <button
                  onClick={handleCopySearchTerms}
                  className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
                >
                  <Copy className="w-4 h-4" />
                  {copied ? 'Copied!' : 'Copy All Search Terms'}
                </button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Use the track list below to manually search and create the playlist on {targetPlatform}.
              </p>
            </div>
          </div>

          {/* Track List */}
          <TrackList tracks={playlistData.tracks} targetPlatform={targetPlatform} />
        </div>
      )}
    </div>
  );
} 