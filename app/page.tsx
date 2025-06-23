"use client";

import { useState } from "react";
import { Music, ArrowRight, Loader2, CheckCircle, XCircle, ExternalLink } from "lucide-react";
import EpicPlaylistConverter from "./components/EpicPlaylistConverter";

export default function Home() {
  const [useEpicConverter, setUseEpicConverter] = useState(false);

  if (useEpicConverter) {
    return <EpicPlaylistConverter />;
  }

  return (
    <div className="min-h-screen bg-transparent relative">
      {/* Header */}
      <header className="relative z-20 p-6 border-b border-gray-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg glow-energy">
                <Music className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-heading font-bold text-white">MUSICAL DNA TRANSFER</h1>
                <p className="text-sm text-gray-400">Advanced Playlist Conversion Technology</p>
              </div>
            </div>
            <button
              onClick={() => setUseEpicConverter(true)}
              className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg font-heading font-semibold hover:from-cyan-500 hover:to-blue-500 transition-all duration-300"
            >
              ENTER CHAMBER
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex items-center justify-center min-h-screen">
        <div className="text-center max-w-4xl mx-auto px-6">
          <h2 className="font-heading text-6xl font-black text-white text-glow mb-6">
            THE FUTURE OF<br />
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              PLAYLIST CONVERSION
            </span>
          </h2>
          
          <p className="font-body text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Experience molecular music transportation with our advanced DNA transfer chamber. 
            Watch your playlists transform through sci-fi visual effects like never before.
          </p>

          <div className="text-center">
            <button
              onClick={() => setUseEpicConverter(true)}
              className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg font-heading font-bold text-lg hover:from-cyan-500 hover:to-blue-500 transition-all duration-300 glow-energy"
            >
              🚀 ACTIVATE TRANSFER CHAMBER
            </button>
            <p className="text-gray-400 mt-4 font-body">
              Experience the future of playlist conversion
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="bg-black/40 border border-cyan-400/30 rounded-xl p-6 backdrop-blur-lg">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 glow-energy">
                <span className="text-2xl">🧬</span>
              </div>
              <h3 className="font-heading text-lg font-bold text-white mb-2">DNA Extraction</h3>
              <p className="text-gray-400 text-sm">
                Advanced algorithms extract musical DNA from your playlists for perfect conversion
              </p>
            </div>

            <div className="bg-black/40 border border-cyan-400/30 rounded-xl p-6 backdrop-blur-lg">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 glow-energy">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="font-heading text-lg font-bold text-white mb-2">Energy Beam Transfer</h3>
              <p className="text-gray-400 text-sm">
                Watch tracks travel through quantum energy beams with mesmerizing visual effects
              </p>
            </div>

            <div className="bg-black/40 border border-cyan-400/30 rounded-xl p-6 backdrop-blur-lg">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 glow-energy">
                <span className="text-2xl">🎵</span>
              </div>
              <h3 className="font-heading text-lg font-bold text-white mb-2">Platform Materialization</h3>
              <p className="text-gray-400 text-sm">
                Experience tracks materializing on destination platforms with particle effects
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>
    </div>
  );
}
