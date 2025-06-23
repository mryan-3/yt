"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

interface TrackOrbProps {
  track: Track;
  index: number;
  totalTracks: number;
  platform: 'spotify' | 'youtube';
  isTransferring?: boolean;
  onHover?: (track: Track | null) => void;
}

const genreColors: { [key: string]: string } = {
  rock: '#FF6B35',
  pop: '#FF69B4',
  'hip-hop': '#9966CC',
  electronic: '#00BFFF',
  jazz: '#DAA520',
  classical: '#8B4513',
  country: '#228B22',
  default: '#E8E8E8'
};

export default function TrackOrb({ 
  track, 
  index, 
  totalTracks, 
  platform,
  isTransferring = false,
  onHover 
}: TrackOrbProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showInfoPanel, setShowInfoPanel] = useState(false);

  // Calculate orb size based on popularity
  const popularity = track.popularity || 50;
  const baseSize = 40;
  const sizeMultiplier = 1 + (popularity / 100) * 0.5; // 1x to 1.5x size
  const orbSize = Math.max(baseSize * sizeMultiplier, 40);

  // Calculate orbital properties
  const minRadius = 120;
  const maxRadius = 220;
  const radiusStep = (maxRadius - minRadius) / Math.max(totalTracks - 1, 1);
  const orbitalRadius = minRadius + (index % 5) * radiusStep;
  
  // Stagger animation delays for visual appeal
  const animationDelay = index * 0.2;
  const rotationDuration = 20 + (index % 3) * 5; // 20-30 seconds
  
  // Get genre color
  const genreColor = genreColors[track.genre?.toLowerCase() || 'default'] || genreColors.default;

  const handleMouseEnter = () => {
    setIsHovered(true);
    onHover?.(track);
    setTimeout(() => setShowInfoPanel(true), 300);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    onHover?.(null);
    setShowInfoPanel(false);
  };

  return (
    <motion.div
      className="absolute top-1/2 left-1/2"
      style={{
        transform: `translate(-50%, -50%)`,
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
      }}
      exit={{ 
        opacity: 0, 
        scale: 0,
        transition: { duration: 0.3 }
      }}
      transition={{ 
        delay: animationDelay,
        duration: 0.5,
        type: "spring",
        stiffness: 100
      }}
    >
      {/* Orbital Container */}
      <motion.div
        className="relative"
        animate={{
          rotate: 360
        }}
        transition={{
          duration: rotationDuration,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{
          width: orbitalRadius * 2,
          height: orbitalRadius * 2,
        }}
      >
        {/* Track Orb */}
        <motion.div
          className="absolute cursor-pointer"
          style={{
            top: 0,
            left: '50%',
            width: orbSize,
            height: orbSize,
            marginLeft: -orbSize / 2,
            marginTop: -orbSize / 2,
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          animate={{
            rotate: -360, // Counter-rotate to keep orb upright
            scale: isHovered ? 1.2 : 1,
          }}
          transition={{
            rotate: {
              duration: rotationDuration,
              repeat: Infinity,
              ease: "linear"
            },
            scale: { duration: 0.2 }
          }}
          whileHover={{
            filter: 'brightness(1.3) drop-shadow(0 0 15px currentColor)'
          }}
        >
          {/* Orb Body */}
          <div
            className={`
              w-full h-full rounded-full relative overflow-hidden
              border-2 transition-all duration-300
              ${isTransferring ? 'animate-pulse' : ''}
            `}
            style={{
              background: `
                radial-gradient(circle at 30% 30%, 
                  ${genreColor}80 0%, 
                  ${genreColor}40 50%, 
                  ${genreColor}20 100%
                )
              `,
              borderColor: isHovered ? genreColor : `${genreColor}60`,
              boxShadow: isHovered 
                ? `0 0 20px ${genreColor}80, inset 0 0 10px ${genreColor}40`
                : `0 0 10px ${genreColor}40`
            }}
          >
            {/* Musical Note Icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span 
                className="text-white font-bold"
                style={{ 
                  fontSize: orbSize * 0.4,
                  textShadow: `0 0 5px ${genreColor}`
                }}
              >
                ♪
              </span>
            </div>

            {/* Popularity Ring */}
            <motion.div
              className="absolute inset-1 rounded-full border opacity-60"
              style={{
                borderColor: genreColor,
                borderStyle: 'dashed'
              }}
              animate={{
                rotate: 360,
                scale: [1, 1.1, 1]
              }}
              transition={{
                rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity }
              }}
            />

            {/* Transfer Effect */}
            <AnimatePresence>
              {isTransferring && (
                <motion.div
                  className="absolute inset-0 rounded-full border-2"
                  style={{ borderColor: '#00FFFF' }}
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{ 
                    scale: [1, 1.5, 2],
                    opacity: [1, 0.5, 0]
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ 
                    duration: 1,
                    repeat: Infinity,
                    ease: "easeOut"
                  }}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Info Panel */}
          <AnimatePresence>
            {showInfoPanel && (
              <motion.div
                className="absolute z-50 pointer-events-none"
                style={{
                  top: -100,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 200
                }}
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                <div
                  className="p-3 rounded-lg shadow-xl border font-body text-sm"
                  style={{
                    background: 'rgba(0, 0, 0, 0.9)',
                    borderColor: genreColor,
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <div className="text-white font-semibold mb-1 truncate">
                    {track.title}
                  </div>
                  <div className="text-gray-300 mb-1 truncate">
                    {track.artist}
                  </div>
                  {track.album && (
                    <div className="text-gray-400 text-xs truncate mb-1">
                      {track.album}
                    </div>
                  )}
                  <div className="flex justify-between items-center text-xs">
                    {track.duration && (
                      <span className="text-gray-400">{track.duration}</span>
                    )}
                    <span 
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{ 
                        background: `${genreColor}20`,
                        color: genreColor 
                      }}
                    >
                      {track.genre || 'Unknown'}
                    </span>
                  </div>
                  
                  {/* Popularity Bar */}
                  <div className="mt-2">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>Popularity</span>
                      <div className="flex-1 h-1 bg-gray-700 rounded">
                        <div 
                          className="h-full rounded transition-all duration-300"
                          style={{ 
                            width: `${popularity}%`,
                            background: genreColor
                          }}
                        />
                      </div>
                      <span>{popularity}%</span>
                    </div>
                  </div>
                </div>
                
                {/* Arrow */}
                <div 
                  className="absolute top-full left-1/2 transform -translate-x-1/2 -translate-y-px"
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: '6px solid transparent',
                    borderRight: '6px solid transparent',
                    borderTop: `6px solid ${genreColor}`
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </motion.div>
  );
} 