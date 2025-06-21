"use client";

import { useState } from "react";
import { ExternalLink, Music, Clock, Search, Copy } from "lucide-react";

interface Track {
  title: string;
  artist: string;
  album?: string;
  duration?: string;
  spotifyUrl?: string;
  youtubeUrl?: string;
}

interface TrackListProps {
  tracks: Track[];
  targetPlatform: string;
}

export default function TrackList({ tracks, targetPlatform }: TrackListProps) {
  const [copiedTrack, setCopiedTrack] = useState<number | null>(null);

  const generateSearchQuery = (track: Track) => {
    return `${track.title} ${track.artist}`;
  };

  const generateSearchUrl = (track: Track) => {
    const query = encodeURIComponent(generateSearchQuery(track));
    
    if (targetPlatform === "Spotify") {
      return `https://open.spotify.com/search/${query}`;
    } else {
      return `https://music.youtube.com/search?q=${query}`;
    }
  };

  const copySearchQuery = (track: Track, index: number) => {
    const query = generateSearchQuery(track);
    navigator.clipboard.writeText(query);
    setCopiedTrack(index);
    setTimeout(() => setCopiedTrack(null), 2000);
  };

  const platformColor = targetPlatform === "Spotify" ? "green" : "red";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          Track List ({tracks.length} songs)
        </h3>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Search on {targetPlatform}
        </div>
      </div>

      <div className="space-y-3">
        {tracks.map((track, index) => (
          <div
            key={index}
            className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            {/* Track Number */}
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-300">
              {index + 1}
            </div>

            {/* Track Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-3">
                <Music className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white truncate">
                    {track.title}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 truncate">
                    {track.artist}
                  </p>
                  {track.album && (
                    <p className="text-sm text-gray-500 dark:text-gray-500 truncate">
                      {track.album}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Duration */}
            {track.duration && (
              <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                {track.duration}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Copy Search Query */}
              <button
                onClick={() => copySearchQuery(track, index)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title="Copy search query"
              >
                <Copy className="w-4 h-4" />
              </button>

              {/* Search on Target Platform */}
              <a
                href={generateSearchUrl(track)}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2 px-3 py-2 text-white rounded-lg transition-colors text-sm ${
                  platformColor === "green" 
                    ? "bg-green-600 hover:bg-green-700" 
                    : "bg-red-600 hover:bg-red-700"
                }`}
                title={`Search on ${targetPlatform}`}
              >
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">Search</span>
              </a>
            </div>

            {/* Copied Feedback */}
            {copiedTrack === index && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-green-600 text-white px-2 py-1 rounded text-xs">
                Copied!
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
        <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
          How to use these results:
        </h4>
        <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
          <li>• Click "Search" next to each track to find it on {targetPlatform}</li>
          <li>• Use the copy button to copy search terms for manual searching</li>
          <li>• Create a new playlist on {targetPlatform} and add the tracks you find</li>
          <li>• Some tracks might not be available or have different versions</li>
        </ul>
      </div>
    </div>
  );
} 