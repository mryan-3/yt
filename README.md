# SpotiTube - Playlist Converter

A user-friendly web application built with Next.js that allows users to convert playlists between Spotify and YouTube Music. Simply paste a playlist URL and get track information to help recreate the playlist on the other platform.

## Features

- **Clean, Modern UI**: Minimalist design with intuitive user experience
- **Platform Support**: Works with both Spotify and YouTube Music playlists
- **URL Parsing**: Automatically detects and parses playlist URLs
- **Track Information**: Extracts song titles, artists, albums, and durations
- **Search Assistance**: Provides direct search links and copyable search terms
- **No Authentication Required**: Works without user login for public playlists

## How It Works

1. **Paste URL**: Enter a public playlist URL from Spotify or YouTube Music
2. **Extract Tracks**: The app extracts track information from the playlist
3. **Get Results**: View track details and search suggestions for the target platform

## 🚀 Real-World Implementation

**This version now includes REAL API integration!** 

### Features
- ✅ **Spotify Integration**: Extracts real playlist data from public Spotify playlists
- ✅ **YouTube Music Auto-Conversion**: Automatically creates playlists in your YouTube Music account
- ✅ **OAuth2 Authentication**: Secure connection to your YouTube Music account
- ✅ **Progress Tracking**: Real-time conversion progress with track-by-track updates
- ✅ **Error Handling**: Graceful handling of tracks that can't be found
- ✅ **No Database Required**: All authentication handled client-side with temporary tokens

### Required Packages
Before running, install these packages:

```bash
pnpm add googleapis google-auth-library js-cookie
pnpm add -D @types/js-cookie
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm

### Setup Instructions

1. **Install Dependencies**:
   ```bash
   pnpm add googleapis google-auth-library js-cookie
   pnpm add -D @types/js-cookie
   ```

2. **Get API Credentials**:
   
   **Spotify API**:
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Create a new app
   - Copy your Client ID and Client Secret
   
   **Google/YouTube API**:
   - Go to [Google Cloud Console](https://console.developers.google.com/)
   - Create a new project or select existing
   - Enable YouTube Data API v3
   - Create OAuth2 credentials
   - Add `http://localhost:3000/auth/callback` to authorized redirect URIs

3. **Environment Setup**:
   ```bash
   cp env.example .env.local
   ```
   Fill in your API credentials in `.env.local`

4. **Start Development Server**:
   ```bash
   pnpm dev
   ```

5. **Open Application**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Technology Stack

- **Framework**: Next.js 15
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Language**: TypeScript
- **HTTP Client**: Axios (for future API integration)

## Project Structure

```
spotitube/
├── app/
│   ├── components/
│   │   ├── PlaylistConverter.tsx    # Main converter component
│   │   └── TrackList.tsx           # Track display component
│   ├── lib/
│   │   └── playlistParser.ts       # URL parsing and data extraction
│   ├── globals.css                 # Global styles and theme
│   ├── layout.tsx                  # Root layout
│   └── page.tsx                    # Home page
├── public/                         # Static assets
├── package.json                    # Dependencies and scripts
└── README.md                      # This file
```

## Current Implementation

This version uses mock data to demonstrate the functionality. In a production environment, you would need to:

1. **Spotify Integration**: Use the Spotify Web API with proper authentication
2. **YouTube Music Integration**: Use the YouTube Data API v3
3. **Rate Limiting**: Implement proper rate limiting and error handling
4. **Caching**: Add caching for better performance
5. **Real Data**: Replace mock data with actual API responses

## Features Breakdown

### URL Parsing
- Supports multiple Spotify URL formats
- Handles YouTube Music and regular YouTube playlist URLs
- Validates and extracts playlist IDs

### User Interface
- Responsive design that works on all devices
- Dark mode support
- Loading states and error handling
- Copy-to-clipboard functionality
- Direct search links to target platforms

### Track Management
- Displays comprehensive track information
- Provides search queries for manual lookup
- Shows conversion progress and results
- Offers both individual and bulk copy options

## Future Enhancements

- Real API integration with Spotify and YouTube Music
- Batch playlist conversion
- Playlist statistics and analytics
- Export functionality (CSV, JSON)
- Saved conversion history
- Advanced matching algorithms for better track finding

## License

This project is for educational and demonstration purposes.
