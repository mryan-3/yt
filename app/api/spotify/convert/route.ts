import { NextRequest, NextResponse } from 'next/server';

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
    const { playlistData, accessToken } = await request.json();

    if (!playlistData || !accessToken) {
      return NextResponse.json({ error: 'Playlist data and access token are required' }, { status: 400 });
    }

    // Get user profile to create playlist
    const userResponse = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!userResponse.ok) {
      throw new Error('Failed to get user profile');
    }

    const user = await userResponse.json();
    const userId = user.id;

    // Validate playlist data before creating
    const playlistName = `${playlistData.title} (from YouTube Music)`;
    
    // Ensure description is a clean string - single line only
    let playlistDescription = '';
    if (playlistData.description && typeof playlistData.description === 'string') {
      playlistDescription = playlistData.description.trim() + ' - ';
    }
    playlistDescription += `Converted from YouTube Music playlist: ${playlistData.originalUrl || ''}`;
    
    // Ensure description isn't too long (Spotify has limits)
    const maxDescriptionLength = 300;
    const truncatedDescription = playlistDescription.length > maxDescriptionLength 
      ? playlistDescription.substring(0, maxDescriptionLength - 3) + '...'
      : playlistDescription;

    const playlistPayload = {
      name: playlistName,
      description: truncatedDescription,
      public: false
    };

    // Create the playlist
    const playlistResponse = await fetch(`https://api.spotify.com/v1/me/playlists`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(playlistPayload)
    });

    const playlistResponseData = await playlistResponse.json();

    if (!playlistResponse.ok) {
      throw new Error(playlistResponseData.error?.message || `Failed to create playlist: ${playlistResponse.status} ${playlistResponse.statusText}`);
    }

    const playlistId = playlistResponseData.id;
    
    let addedTracks = 0;
    const failedTracks: string[] = [];
    const foundTrackUris: string[] = [];

    // Search for tracks and collect URIs
    for (let i = 0; i < playlistData.tracks.length; i++) {
      const track = playlistData.tracks[i];
      const searchQuery = `track:"${track.title}" artist:"${track.artist}"`;

      try {
        // Search for track
        const searchResponse = await fetch(
          `https://api.spotify.com/v1/search?${new URLSearchParams({
            q: searchQuery,
            type: 'track',
            limit: '1'
          })}`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          }
        );

        const searchData = await searchResponse.json();

        if (searchResponse.ok && searchData.tracks?.items?.length > 0) {
          const spotifyTrack = searchData.tracks.items[0];
          foundTrackUris.push(spotifyTrack.uri);
          addedTracks++;
        } else {
          // Try a broader search without quotes
          const broadSearchQuery = `${track.title} ${track.artist}`;
          const broadSearchResponse = await fetch(
            `https://api.spotify.com/v1/search?${new URLSearchParams({
              q: broadSearchQuery,
              type: 'track',
              limit: '1'
            })}`,
            {
              headers: {
                'Authorization': `Bearer ${accessToken}`
              }
            }
          );

          const broadSearchData = await broadSearchResponse.json();

          if (broadSearchResponse.ok && broadSearchData.tracks?.items?.length > 0) {
            const spotifyTrack = broadSearchData.tracks.items[0];
            foundTrackUris.push(spotifyTrack.uri);
            addedTracks++;
          } else {
            failedTracks.push(`${track.title} by ${track.artist}`);
          }
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        failedTracks.push(`${track.title} by ${track.artist}`);
      }
    }

    // Add all found tracks to playlist in batches
    if (foundTrackUris.length > 0) {
      const batchSize = 100; // Spotify API allows up to 100 tracks per request
      
      for (let i = 0; i < foundTrackUris.length; i += batchSize) {
        const batch = foundTrackUris.slice(i, i + batchSize);
        
        const addTracksResponse = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            uris: batch
          })
        });

        if (!addTracksResponse.ok) {
          // Failed to add tracks batch
        }

        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    return NextResponse.json({
      playlistId,
      addedTracks,
      failedTracks,
      playlistUrl: `https://open.spotify.com/playlist/${playlistId}`
    });
  } catch (error) {
    console.error('Error converting playlist:', error);
    return NextResponse.json({ error: 'Failed to convert playlist' }, { status: 500 });
  }
} 