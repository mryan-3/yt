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

  useEffect(() => {
    // Check if user is authenticated with YouTube
    setIsYouTubeAuthenticated(youtubeClient.isAuthenticated());
    
    // Handle auth code from callback
    const authCode = localStorage.getItem('youtube_auth_code');
    if (authCode) {
      youtubeClient.getTokens(authCode).then(() => {
        setIsYouTubeAuthenticated(true);
        localStorage.removeItem('youtube_auth_code');
      }).catch(console.error);
    }
  }, [youtubeClient]);

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
        throw new Error("YouTube to Spotify conversion not implemented yet");
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

  const handleAutoConvert = async () => {
    if (!playlistData || !isYouTubeAuthenticated) return;

    setConverting(true);
    setConversionProgress(null);
    setError("");

    try {
      const result = await youtubeClient.convertSpotifyPlaylist(
        playlistData,
        (current, total, trackTitle) => {
          setConversionProgress({ current, total, trackTitle });
        }
      );

      const playlistUrl = youtubeClient.getPlaylistUrl(result.playlistId);
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
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {playlistData.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span>{playlistData.tracks.length} tracks</span>
                  <span>•</span>
                  <span className="capitalize">From {playlistData.platform}</span>
                </div>
              </div>
              
              <a
                href={playlistData.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                View Original
              </a>
            </div>

            {/* Auto-Conversion Section */}
            {playlistData.platform === 'spotify' && (
              <div className="p-4 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-red-800 dark:text-red-300 mb-1 flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Auto-Convert to YouTube Music
                    </h4>
                    <p className="text-sm text-red-600 dark:text-red-400">
                      Automatically create this playlist in your YouTube Music account
                    </p>
                  </div>
                </div>

                {!isYouTubeAuthenticated ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-400">
                      <Shield className="w-4 h-4" />
                      You need to connect your YouTube Music account first
                    </div>
                    <button
                      onClick={handleYouTubeAuth}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
                    >
                      <Youtube className="w-4 h-4" />
                      Connect YouTube Music
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <CheckCircle className="w-4 h-4" />
                      YouTube Music connected
                    </div>
                    <button
                      onClick={handleAutoConvert}
                      disabled={converting}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg transition-colors text-sm"
                    >
                      {converting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Converting...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          Auto-Convert Now
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Manual Conversion Direction */}
            <div className={`p-4 rounded-lg border ${
              targetPlatformColor === "green"
                ? "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800"
                : "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800"
            }`}>
              <div className="flex items-center justify-between">
                                  <div>
                    <h4 className={`font-medium mb-1 ${
                      targetPlatformColor === "green"
                        ? "text-green-800 dark:text-green-300"
                        : "text-red-800 dark:text-red-300"
                    }`}>
                      Manual Conversion to {targetPlatform}
                    </h4>
                    <p className={`text-sm ${
                      targetPlatformColor === "green"
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}>
                      Use the track information below to manually recreate this playlist
                    </p>
                  </div>
                
                <button
                  onClick={handleCopySearchTerms}
                  className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors text-sm ${
                    targetPlatformColor === "green"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Search Terms
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Conversion Progress */}
          {conversionProgress && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Converting Playlist...
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Progress: {conversionProgress.current} of {conversionProgress.total}</span>
                  <span>{Math.round((conversionProgress.current / conversionProgress.total) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-red-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(conversionProgress.current / conversionProgress.total) * 100}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Currently adding: <span className="font-medium">{conversionProgress.trackTitle}</span>
                </p>
              </div>
            </div>
          )}

          {/* Conversion Result */}
          {conversionResult && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Conversion Complete!
                </h3>
              </div>
              
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
                    <h4 className="font-medium text-green-800 dark:text-green-300 mb-1">
                      Successfully Added
                    </h4>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {conversionResult.addedTracks}
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">tracks</p>
                  </div>
                  
                  {conversionResult.failedTracks.length > 0 && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg">
                      <h4 className="font-medium text-yellow-800 dark:text-yellow-300 mb-1">
                        Could Not Find
                      </h4>
                      <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                        {conversionResult.failedTracks.length}
                      </p>
                      <p className="text-sm text-yellow-600 dark:text-yellow-400">tracks</p>
                    </div>
                  )}
                </div>

                <a
                  href={conversionResult.playlistUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
                >
                  <Youtube className="w-5 h-5" />
                  Open Playlist in YouTube Music
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
            </div>
          )}

          {/* Track List */}
          <TrackList tracks={playlistData.tracks} targetPlatform={targetPlatform} />
        </div>
      )}
    </div>
  );
} 