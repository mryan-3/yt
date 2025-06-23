"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TransferBeamProps {
  isActive: boolean;
  sourcePlatform: 'spotify' | 'youtube';
  targetPlatform: 'spotify' | 'youtube';
  progress?: number;
  currentTrack?: string;
  onTransferComplete?: () => void;
}

interface DNAParticle {
  id: string;
  x: number;
  y: number;
  progress: number;
  speed: number;
  color: string;
  isSuccess: boolean;
}

export default function TransferBeam({
  isActive,
  sourcePlatform,
  targetPlatform,
  progress = 0,
  currentTrack = "",
  onTransferComplete
}: TransferBeamProps) {
  const [particles, setParticles] = useState<DNAParticle[]>([]);
  const [scanPosition, setScanPosition] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  const sourceColor = sourcePlatform === 'spotify' ? '#1DB954' : '#FF0000';
  const targetColor = targetPlatform === 'spotify' ? '#1DB954' : '#FF0000';

  const generateDNAParticles = () => {
    const newParticles: DNAParticle[] = [];
    
    for (let i = 0; i < 10; i++) {
      const isSuccess = Math.random() > 0.1; // 90% success rate
      newParticles.push({
        id: `particle-${i}-${Date.now()}`,
        x: 0,
        y: Math.random() * 200 + 100, // Random height in beam
        progress: 0,
        speed: 0.5 + Math.random() * 0.5,
        color: isSuccess ? '#00FF88' : '#FF4444',
        isSuccess
      });
    }
    
    setParticles(newParticles);
  };

  // Initialize DNA particles
  useEffect(() => {
    if (!isActive) {
      setParticles([]);
      return;
    }

    // Start scanning animation
    setIsScanning(true);
    setScanPosition(0);

    const scanInterval = setInterval(() => {
      setScanPosition(prev => {
        if (prev >= 100) {
          setIsScanning(false);
          // Start generating DNA particles
          generateDNAParticles();
          clearInterval(scanInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(scanInterval);
  }, [isActive]);

  // Animate particles
  useEffect(() => {
    if (particles.length === 0) return;

    const animate = () => {
      setParticles(prevParticles => {
        const updatedParticles = prevParticles.map(particle => {
          const newProgress = particle.progress + particle.speed;
          
          // Failed particles dissolve at 50%
          if (!particle.isSuccess && newProgress > 50) {
            return { ...particle, progress: newProgress, color: '#FF000040' };
          }
          
          return { ...particle, progress: newProgress };
        }).filter(particle => particle.progress < 105); // Remove completed particles

        // Generate new particles occasionally
        if (updatedParticles.length < 5 && Math.random() > 0.7) {
          const isSuccess = Math.random() > 0.1;
          updatedParticles.push({
            id: `particle-${Date.now()}-${Math.random()}`,
            x: 0,
            y: Math.random() * 200 + 100,
            progress: 0,
            speed: 0.5 + Math.random() * 0.5,
            color: isSuccess ? '#00FF88' : '#FF4444',
            isSuccess
          });
        }

        return updatedParticles;
      });

      if (isActive) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [particles.length, isActive]);

  // Beam canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isActive) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 600;
    canvas.height = 400;

    let beamTime = 0;

    const animateBeam = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      beamTime += 0.05;

      // Draw main energy beam
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, `${sourceColor}40`);
      gradient.addColorStop(0.5, '#00FFFF80');
      gradient.addColorStop(1, `${targetColor}40`);

      ctx.fillStyle = gradient;
      ctx.fillRect(0, canvas.height / 2 - 20, canvas.width, 40);

      // Draw energy waves
      ctx.strokeStyle = '#00FFFF';
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.8;

      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        const offsetY = canvas.height / 2 + (i - 1) * 15;
        
        for (let x = 0; x < canvas.width; x += 5) {
          const y = offsetY + Math.sin((x + beamTime * 100) * 0.02) * 5;
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      ctx.globalAlpha = 1;

      if (isActive) {
        requestAnimationFrame(animateBeam);
      }
    };

    animateBeam();
  }, [isActive, sourceColor, targetColor]);

  if (!isActive) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {/* Main Beam Container */}
      <div className="relative w-full max-w-4xl h-96">
        
        {/* Background Beam Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{ filter: 'blur(1px)' }}
        />

        {/* Main Energy Beam */}
        <motion.div
          className="absolute top-1/2 left-0 right-0 h-8 -translate-y-1/2"
          style={{
            background: `linear-gradient(90deg, ${sourceColor}60, #00FFFF, ${targetColor}60)`,
            filter: 'drop-shadow(0 0 20px #00FFFF)'
          }}
          animate={{
            opacity: [0.6, 1, 0.6],
            scaleY: [1, 1.1, 1]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Scanning Laser */}
        <AnimatePresence>
          {isScanning && (
            <motion.div
              className="absolute top-0 bottom-0 w-1 bg-cyan-400"
              style={{
                left: `${scanPosition}%`,
                filter: 'drop-shadow(0 0 10px #00FFFF)',
                zIndex: 10
              }}
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: [0, 1, 0],
                scaleY: [0.5, 1, 0.5]
              }}
              exit={{ opacity: 0 }}
              transition={{
                opacity: { duration: 0.3, repeat: Infinity },
                scaleY: { duration: 0.5, repeat: Infinity }
              }}
            />
          )}
        </AnimatePresence>

        {/* DNA Particles */}
        <AnimatePresence>
          {particles.map(particle => (
            <motion.div
              key={particle.id}
              className="absolute w-6 h-6"
              style={{
                left: `${particle.progress}%`,
                top: particle.y,
                transform: 'translate(-50%, -50%)'
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: particle.isSuccess ? [0.8, 1, 0.8] : [0.8, 0.3, 0],
                scale: 1,
                rotate: particle.progress * 4
              }}
              exit={{ 
                opacity: 0, 
                scale: 0.5,
                y: particle.isSuccess ? particle.y : particle.y + 50
              }}
              transition={{
                opacity: { duration: 0.5, repeat: Infinity },
                rotate: { duration: 0.1, ease: "linear" }
              }}
            >
              {/* DNA Helix */}
              <div className="relative w-full h-full">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: particle.color,
                    filter: `drop-shadow(0 0 8px ${particle.color})`
                  }}
                />
                
                {/* Helix Strands */}
                <div className="absolute inset-1">
                  <div
                    className="w-full h-0.5 absolute top-1/4"
                    style={{ background: particle.color }}
                  />
                  <div
                    className="w-full h-0.5 absolute bottom-1/4"
                    style={{ background: particle.color }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Transfer Stats */}
        <motion.div
          className="absolute -bottom-16 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          <div className="bg-black/80 border border-cyan-400/50 rounded-lg p-4 backdrop-blur-sm">
            <div className="font-mono text-cyan-400 text-sm text-center">
              <div className="mb-2">TRANSFERRING MUSICAL DNA</div>
              
              {/* Progress Bar */}
              <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden mb-2">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-400 to-green-400"
                  style={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              
              <div className="text-xs text-gray-400">
                {currentTrack && `Current: ${currentTrack}`}
              </div>
              
              <div className="text-xs text-green-400 mt-1">
                {`${Math.round(progress)}% Complete`}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Energy Discharge Effects */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            background: [
              'radial-gradient(circle at 50% 50%, transparent 60%, #00FFFF10 70%, transparent 80%)',
              'radial-gradient(circle at 50% 50%, transparent 50%, #00FFFF20 60%, transparent 70%)',
              'radial-gradient(circle at 50% 50%, transparent 60%, #00FFFF10 70%, transparent 80%)'
            ]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Particle Burst Points */}
        <div className="absolute top-1/2 left-0 w-8 h-8 -translate-y-1/2 -translate-x-4">
          <motion.div
            className="w-full h-full rounded-full"
            style={{
              background: sourceColor,
              filter: `drop-shadow(0 0 15px ${sourceColor})`
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 1,
              repeat: Infinity
            }}
          />
        </div>

        <div className="absolute top-1/2 right-0 w-8 h-8 -translate-y-1/2 translate-x-4">
          <motion.div
            className="w-full h-full rounded-full"
            style={{
              background: targetColor,
              filter: `drop-shadow(0 0 15px ${targetColor})`
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: 0.5
            }}
          />
        </div>
      </div>
    </div>
  );
} 