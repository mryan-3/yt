"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PlatformPod from "./PlatformPod";
import TrackOrb from "./TrackOrb";
import TransferBeam from "./TransferBeam";

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

interface TransferChamberProps {
  playlistData: PlaylistData | null;
  isSpotifyAuthenticated: boolean;
  isYouTubeAuthenticated: boolean;
  isConverting: boolean;
  conversionProgress?: {
    current: number;
    total: number;
    trackTitle: string;
  };
  onSpotifyConnect: () => void;
  onYouTubeConnect: () => void;
  onStartConversion: () => void;
}

export default function TransferChamber({
  playlistData,
  isSpotifyAuthenticated,
  isYouTubeAuthenticated,
  isConverting,
  conversionProgress,
  onSpotifyConnect,
  onYouTubeConnect,
  onStartConversion
}: TransferChamberProps) {
  const [hoveredTrack, setHoveredTrack] = useState<Track | null>(null);
  const [chamberActive, setChamberActive] = useState(false);
  const [showTrackOrbs, setShowTrackOrbs] = useState(false);

  const sourcePlatform = playlistData?.platform || 'spotify';
  const targetPlatform = sourcePlatform === 'spotify' ? 'youtube' : 'spotify';
  
  const isSourceAuthenticated = sourcePlatform === 'spotify' ? isSpotifyAuthenticated : isYouTubeAuthenticated;
  const isTargetAuthenticated = targetPlatform === 'spotify' ? isSpotifyAuthenticated : isYouTubeAuthenticated;

  const progress = conversionProgress 
    ? Math.round((conversionProgress.current / conversionProgress.total) * 100)
    : 0;

  // Activate chamber when playlist is loaded
  useEffect(() => {
    if (playlistData && isSourceAuthenticated) {
      setChamberActive(true);
      setTimeout(() => setShowTrackOrbs(true), 1000);
    } else {
      setChamberActive(false);
      setShowTrackOrbs(false);
    }
  }, [playlistData, isSourceAuthenticated]);

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden">
      {/* Chamber Background Effects */}
      <motion.div 
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: chamberActive 
            ? [
                'radial-gradient(circle at 25% 50%, rgba(29, 185, 84, 0.1) 0%, transparent 50%)',
                'radial-gradient(circle at 75% 50%, rgba(255, 0, 0, 0.1) 0%, transparent 50%)',
                'radial-gradient(circle at 25% 50%, rgba(29, 185, 84, 0.1) 0%, transparent 50%)'
              ]
            : 'transparent'
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      />

      {/* Header */}
      <header className="relative z-20 p-6">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h1 className="font-heading text-5xl font-black text-white text-glow mb-4">
            MUSICAL DNA TRANSFER CHAMBER
          </h1>
          <p className="font-body text-lg text-gray-300 max-w-2xl mx-auto">
            Advanced molecular music transportation system for cross-platform playlist conversion
          </p>
        </motion.div>
      </header>

      {/* Main Transfer Chamber */}
      <div className="relative flex-1 px-6 py-12">
        <div className="relative max-w-7xl mx-auto h-96">
          
          {/* Platform Pods Container */}
          <div className="relative h-full flex items-center justify-between">
            
            {/* Spotify Platform Pod */}
            <motion.div
              className="relative z-10"
              initial={{ x: -200, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.5 }}
            >
              <PlatformPod
                platform="spotify"
                isAuthenticated={isSpotifyAuthenticated}
                isActive={sourcePlatform === 'spotify' || targetPlatform === 'spotify'}
                onConnect={onSpotifyConnect}
              />
              
              {/* Source Platform Track Orbs */}
              <AnimatePresence>
                {showTrackOrbs && playlistData && sourcePlatform === 'spotify' && (
                  <div className="absolute inset-0">
                    {playlistData.tracks.slice(0, 8).map((track, index) => (
                      <TrackOrb
                        key={`${track.title}-${index}`}
                        track={track}
                        index={index}
                        totalTracks={Math.min(playlistData.tracks.length, 8)}
                        platform="spotify"
                        isTransferring={isConverting}
                        onHover={setHoveredTrack}
                      />
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Transfer Beam */}
            <div className="absolute inset-0 z-5">
              <TransferBeam
                isActive={isConverting}
                sourcePlatform={sourcePlatform}
                targetPlatform={targetPlatform}
                progress={progress}
                currentTrack={conversionProgress?.trackTitle}
              />
            </div>

            {/* YouTube Music Platform Pod */}
            <motion.div
              className="relative z-10"
              initial={{ x: 200, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.7 }}
            >
              <PlatformPod
                platform="youtube"
                isAuthenticated={isYouTubeAuthenticated}
                isActive={sourcePlatform === 'youtube' || targetPlatform === 'youtube'}
                onConnect={onYouTubeConnect}
              />
              
              {/* Source Platform Track Orbs */}
              <AnimatePresence>
                {showTrackOrbs && playlistData && sourcePlatform === 'youtube' && (
                  <div className="absolute inset-0">
                    {playlistData.tracks.slice(0, 8).map((track, index) => (
                      <TrackOrb
                        key={`${track.title}-${index}`}
                        track={track}
                        index={index}
                        totalTracks={Math.min(playlistData.tracks.length, 8)}
                        platform="youtube"
                        isTransferring={isConverting}
                        onHover={setHoveredTrack}
                      />
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>

        {/* Transfer Control Panel */}
        <motion.div
          className="relative z-20 mt-16 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1 }}
        >
          <div className="bg-black/60 border border-cyan-400/30 rounded-xl p-6 backdrop-blur-lg">
            
            {/* Playlist Info */}
            {playlistData && (
              <div className="text-center mb-6">
                <h3 className="font-heading text-xl text-white mb-2">
                  {playlistData.title}
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  {playlistData.tracks.length} tracks • From {sourcePlatform.toUpperCase()}
                </p>
                
                <div className="flex items-center justify-center gap-4 text-sm">
                  <div className={`px-3 py-1 rounded ${isSourceAuthenticated ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                    Source: {sourcePlatform.toUpperCase()} {isSourceAuthenticated ? '✓' : '✗'}
                  </div>
                  <div className="text-cyan-400">→</div>
                  <div className={`px-3 py-1 rounded ${isTargetAuthenticated ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                    Target: {targetPlatform.toUpperCase()} {isTargetAuthenticated ? '✓' : '✗'}
                  </div>
                </div>
              </div>
            )}

            {/* Transfer Button */}
            <div className="text-center">
              {playlistData && isSourceAuthenticated && isTargetAuthenticated ? (
                <motion.button
                  onClick={onStartConversion}
                  disabled={isConverting}
                  className={`
                    px-8 py-4 rounded-lg font-heading font-bold text-lg
                    ${isConverting 
                      ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-500 glow-energy'
                    }
                    transition-all duration-300
                  `}
                  whileHover={!isConverting ? { scale: 1.05 } : {}}
                  whileTap={!isConverting ? { scale: 0.95 } : {}}
                >
                  {isConverting ? 'TRANSFERRING DNA...' : 'INITIATE TRANSFER'}
                </motion.button>
              ) : (
                <div className="text-gray-400 font-body">
                  {!playlistData 
                    ? 'Load a playlist to begin transfer sequence'
                    : 'Authenticate with both platforms to enable transfer'
                  }
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Hovered Track Info */}
        <AnimatePresence>
          {hoveredTrack && !isConverting && (
            <motion.div
              className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-30"
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-black/90 border border-cyan-400/50 rounded-lg p-4 backdrop-blur-lg max-w-md">
                <div className="text-white font-semibold mb-1">
                  {hoveredTrack.title}
                </div>
                <div className="text-gray-300 text-sm mb-2">
                  by {hoveredTrack.artist}
                </div>
                {hoveredTrack.album && (
                  <div className="text-gray-400 text-xs">
                    from {hoveredTrack.album}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ambient Particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 3,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 