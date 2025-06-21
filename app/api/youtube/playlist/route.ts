import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

interface Track {
  title: string;
  artist: string;
  album?: string;
  duration?: string;
  youtubeVideoId?: string;
}

interface PlaylistData {
  title: string;
  description?: string;
  tracks: Track[];
  platform: 'spotify' | 'youtube';
  originalUrl: string;
}

export async function POST(request: NextRequest) {
  try {
    const { playlistId, accessToken } = await request.json();

    if (!playlistId || !accessToken) {
      return NextResponse.json({ error: 'Playlist ID and access token are required' }, { status: 400 });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.NEXT_PUBLIC_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      access_token: accessToken
    });

    const youtube = google.youtube({
      version: 'v3',
      auth: oauth2Client
    });

    // Get playlist details
    const playlistResponse = await youtube.playlists.list({
      part: ['snippet'],
      id: [playlistId]
    });

    if (!playlistResponse.data.items || playlistResponse.data.items.length === 0) {
      throw new Error('Playlist not found');
    }

    const playlist = playlistResponse.data.items[0];
    const playlistTitle = playlist.snippet?.title || 'Untitled Playlist';
    const playlistDescription = playlist.snippet?.description || '';

    // Get playlist items
    let allTracks: Track[] = [];
    let nextPageToken: string | undefined;

    do {
      const itemsResponse = await youtube.playlistItems.list({
        part: ['snippet', 'contentDetails'],
        playlistId: playlistId,
        maxResults: 50,
        pageToken: nextPageToken
      });

      if (itemsResponse.data.items) {
        const tracks = itemsResponse.data.items.map(item => {
          const snippet = item.snippet;
          const title = snippet?.title || 'Unknown Title';
          const channelTitle = snippet?.videoOwnerChannelTitle || snippet?.channelTitle || 'Unknown Artist';
          
          // Clean up artist name (remove common channel suffixes)
          let artist = channelTitle
            .replace(/\s-\sTopic$/, '')
            .replace(/\sVEVO$/, '')
            .replace(/\sOfficial$/, '');

          // Try to extract artist from title if title contains " - "
          if (title.includes(' - ')) {
            const parts = title.split(' - ');
            if (parts.length >= 2) {
              artist = parts[0].trim();
            }
          }

          return {
            title: title,
            artist: artist,
            youtubeVideoId: snippet?.resourceId?.videoId,
            duration: undefined // YouTube API doesn't provide duration in playlist items
          } as Track;
        });

        allTracks = allTracks.concat(tracks);
      }

      nextPageToken = itemsResponse.data.nextPageToken || undefined;
    } while (nextPageToken);

    const playlistData: PlaylistData = {
      title: playlistTitle,
      description: playlistDescription,
      tracks: allTracks,
      platform: 'youtube',
      originalUrl: `https://music.youtube.com/playlist?list=${playlistId}`
    };

    return NextResponse.json(playlistData);
  } catch (error) {
    console.error('Error fetching YouTube playlist:', error);
    return NextResponse.json({ error: 'Failed to fetch YouTube playlist' }, { status: 500 });
  }
} 