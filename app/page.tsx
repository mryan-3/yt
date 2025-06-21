"use client";

import { useState } from "react";
import { Music, ArrowRight, Loader2, CheckCircle, XCircle, ExternalLink } from "lucide-react";
import PlaylistConverter from "./components/PlaylistConverter";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-green-500 to-red-500 rounded-lg">
              <Music className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">SpotiTube</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Convert playlists between Spotify and YouTube Music</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Seamlessly Convert Your Playlists
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Paste a playlist URL from Spotify or YouTube Music and get track information 
            to help you recreate it on the other platform.
          </p>
          
          {/* Platform Icons */}
          <div className="flex items-center justify-center gap-8 mb-12">
            <div className="flex items-center gap-3 p-4 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Music className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium text-green-700 dark:text-green-300">Spotify</span>
            </div>
            
            <ArrowRight className="w-6 h-6 text-gray-400" />
            
            <div className="flex items-center gap-3 p-4 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <Music className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium text-red-700 dark:text-red-300">YouTube Music</span>
            </div>
          </div>
        </div>

        {/* Converter Component */}
        <PlaylistConverter />

        {/* How It Works */}
        <div className="mt-16 bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            How It Works
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">1</span>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Paste URL</h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Copy and paste a public playlist URL from Spotify or YouTube Music
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">2</span>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Extract Tracks</h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                We extract track information including song titles, artists, and albums
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">3</span>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Get Results</h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                View the track list and search suggestions for the target platform
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            SpotiTube - Playlist conversion made simple
          </p>
        </div>
      </footer>
    </div>
  );
}
