import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

interface Track {
  title: string;
  artist: string;
  album?: string;
  duration?: string;
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
    const { playlistData, accessToken } = await request.json();

    if (!playlistData || !accessToken) {
      return NextResponse.json({ error: 'Playlist data and access token are required' }, { status: 400 });
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

    // Create the playlist
    const playlistResponse = await youtube.playlists.insert({
      part: ['snippet', 'status'],
      requestBody: {
        snippet: {
          title: `${playlistData.title} (from Spotify)`,
          description: `${playlistData.description || ''}\n\nConverted from Spotify playlist: ${playlistData.originalUrl}`,
          defaultLanguage: 'en'
        },
        status: {
          privacyStatus: 'private'
        }
      }
    });

    const playlistId = playlistResponse.data.id;
    if (!playlistId) {
      throw new Error('Failed to create playlist - no playlist ID returned');
    }

    let addedTracks = 0;
    const failedTracks: string[] = [];

    // Add tracks one by one
    for (let i = 0; i < playlistData.tracks.length; i++) {
      const track = playlistData.tracks[i];
      const searchQuery = `${track.title} ${track.artist}`;

      try {
        // Search for video
        const searchResponse = await youtube.search.list({
          part: ['snippet'],
          q: searchQuery,
          type: ['video'],
          maxResults: 1,
          videoCategoryId: '10' // Music category
        });

        if (searchResponse.data.items && searchResponse.data.items.length > 0) {
          const item = searchResponse.data.items[0];
          const videoId = item.id?.videoId;
          
          if (videoId) {
            // Add to playlist
            await youtube.playlistItems.insert({
              part: ['snippet'],
              requestBody: {
                snippet: {
                  playlistId,
                  resourceId: {
                    kind: 'youtube#video',
                    videoId
                  }
                }
              }
            });

            addedTracks++;
          } else {
            failedTracks.push(`${track.title} by ${track.artist}`);
          }
        } else {
          failedTracks.push(`${track.title} by ${track.artist}`);
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

        // Send progress update
        if (i % 5 === 0) { // Send update every 5 tracks
          // In a real implementation, you might use WebSockets or Server-Sent Events for real-time updates
        }
      } catch (error) {
        console.error(`Failed to add track: ${searchQuery}`, error);
        failedTracks.push(`${track.title} by ${track.artist}`);
      }
    }

    return NextResponse.json({
      playlistId,
      addedTracks,
      failedTracks,
      playlistUrl: `https://music.youtube.com/playlist?list=${playlistId}`
    });
  } catch (error) {
    console.error('Error converting playlist:', error);
    return NextResponse.json({ error: 'Failed to convert playlist' }, { status: 500 });
  }
} 