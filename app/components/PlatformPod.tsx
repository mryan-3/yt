"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface PlatformPodProps {
  platform: 'spotify' | 'youtube';
  isAuthenticated: boolean;
  isActive: boolean;
  onConnect: () => void;
  className?: string;
}

export default function PlatformPod({ 
  platform, 
  isAuthenticated, 
  isActive, 
  onConnect,
  className = "" 
}: PlatformPodProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const podRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const colors = platform === 'spotify' 
    ? {
        primary: '#1DB954',
        glow: '#1DB954',
        accent: '#00FFFF',
        particles: 'rgba(29, 185, 84, 0.2)'
      }
    : {
        primary: '#FF0000',
        glow: '#FF0000', 
        accent: '#FF6600',
        particles: 'rgba(255, 0, 0, 0.2)'
      };

  // Particle system
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 300;
    canvas.height = 300;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      angle: number;
      speed: number;
    }> = [];

    // Initialize particles
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 6 + 2,
        opacity: Math.random() * 0.5 + 0.1,
        angle: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.02 + 0.005
      });
    }

    let animationId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(particle => {
        // Update particle position
        if (platform === 'spotify') {
          // Aurora-style floating for Spotify
          particle.y += particle.vy;
          particle.x += particle.vx;
          particle.angle += particle.speed;
          particle.y += Math.sin(particle.angle) * 0.5;
        } else {
          // Flowing energy streams for YouTube
          particle.x += particle.vx * 2;
          particle.y += Math.sin(particle.x * 0.01) * 0.5;
        }

        // Wrap around edges
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.y > canvas.height) particle.y = 0;
        if (particle.y < 0) particle.y = canvas.height;

        // Draw particle
        ctx.save();
        ctx.globalAlpha = particle.opacity;
        ctx.fillStyle = colors.primary;
        ctx.shadowBlur = 10;
        ctx.shadowColor = colors.glow;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [platform, colors]);

  // Mouse tracking for magnetic effect
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!podRef.current) return;
    
    const rect = podRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const x = e.clientX - centerX;
    const y = e.clientY - centerY;
    
    setMousePosition({ x: x * 0.1, y: y * 0.1 });
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setMousePosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={podRef}
      className={`relative w-80 h-80 ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        rotateX: mousePosition.y,
        rotateY: mousePosition.x,
      }}
      transition={{ 
        duration: 0.8,
        rotateX: { duration: 0.3 },
        rotateY: { duration: 0.3 }
      }}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px'
      }}
    >
      {/* Main Platform */}
      <motion.div
        className={`
          relative w-full h-full rounded-full 
          ${platform === 'spotify' ? 'floating' : 'floating-delayed'}
          cursor-pointer transition-all duration-300
          ${isAuthenticated ? 'glow-' + platform : 'opacity-60'}
          ${isActive ? 'scale-105' : ''}
        `}
        style={{
          background: `
            radial-gradient(circle at center, 
              ${colors.particles} 0%, 
              rgba(26, 26, 26, 0.8) 50%, 
              rgba(10, 10, 10, 0.9) 100%
            )
          `,
          border: `2px solid ${isAuthenticated ? colors.primary : '#444'}`,
          boxShadow: isAuthenticated 
            ? `0 0 40px ${colors.glow}, inset 0 0 20px ${colors.particles}` 
            : '0 0 20px rgba(255,255,255,0.1)'
        }}
        onClick={onConnect}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Particle Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full rounded-full pointer-events-none"
          style={{ opacity: isAuthenticated ? 1 : 0.3 }}
        />

        {/* Platform Logo */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="w-24 h-24 rounded-full flex items-center justify-center font-heading font-bold text-2xl"
            style={{
              background: `linear-gradient(45deg, ${colors.primary}, ${colors.accent})`,
              color: 'white'
            }}
            animate={{ 
              rotate: 360,
              scale: isHovering ? 1.1 : 1
            }}
            transition={{ 
              rotate: { duration: 20, repeat: Infinity, ease: "linear" },
              scale: { duration: 0.3 }
            }}
          >
            {platform === 'spotify' ? '♫' : '▶'}
          </motion.div>
        </div>

        {/* Status Ring */}
        <motion.div
          className="absolute inset-4 rounded-full border-2 pointer-events-none"
          style={{
            borderColor: isAuthenticated ? colors.accent : 'transparent'
          }}
          animate={{
            rotate: 360,
            scale: isActive ? [1, 1.05, 1] : 1
          }}
          transition={{
            rotate: { duration: 15, repeat: Infinity, ease: "linear" },
            scale: { duration: 2, repeat: Infinity }
          }}
        />

        {/* Platform Label */}
        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
          <motion.div
            className={`
              px-4 py-2 rounded-lg font-heading font-semibold text-sm
              ${isAuthenticated ? 'text-white' : 'text-gray-400'}
            `}
            style={{
              background: isAuthenticated 
                ? `linear-gradient(45deg, ${colors.primary}20, ${colors.accent}20)`
                : 'rgba(68, 68, 68, 0.2)',
              border: `1px solid ${isAuthenticated ? colors.primary : '#444'}`
            }}
            animate={{
              textShadow: isAuthenticated 
                ? `0 0 10px ${colors.glow}` 
                : 'none'
            }}
          >
            {platform === 'spotify' ? 'SPOTIFY' : 'YOUTUBE MUSIC'}
          </motion.div>
        </div>

        {/* Connection Status */}
        {!isAuthenticated && (
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="text-center">
              <div className="text-white font-heading text-lg mb-2">CONNECT</div>
              <div className="text-gray-400 text-sm">Click to Authenticate</div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Holographic Base */}
      <motion.div
        className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-96 h-8 rounded-full"
        style={{
          background: `radial-gradient(ellipse, ${colors.particles} 0%, transparent 70%)`,
          filter: 'blur(8px)'
        }}
        animate={{
          scaleX: isHovering ? 1.2 : 1,
          opacity: isAuthenticated ? 0.6 : 0.2
        }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
} 