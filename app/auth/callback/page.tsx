"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function AuthCallback() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [platform, setPlatform] = useState<string>('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');
      const state = searchParams.get('state');

      // Determine platform from state parameter
      const authPlatform = state === 'spotify' ? 'Spotify' : 'YouTube Music';
      setPlatform(authPlatform);

      if (error) {
        setStatus('error');
        setMessage(`Authentication was cancelled or failed for ${authPlatform}`);
        return;
      }

      if (!code) {
        setStatus('error');
        setMessage('No authorization code received');
        return;
      }

      try {
        if (state === 'spotify') {
          // Store the auth code for Spotify
          localStorage.setItem('spotify_auth_code', code);
          setStatus('success');
          setMessage('Successfully authenticated with Spotify!');
        } else {
          // Default to YouTube Music
        localStorage.setItem('youtube_auth_code', code);
        setStatus('success');
        setMessage('Successfully authenticated with YouTube Music!');
        }
        
        // Redirect back to main app after 2 seconds
        setTimeout(() => {
          router.push('/?auth=success');
        }, 2000);
      } catch (error) {
        setStatus('error');
        setMessage('Failed to process authentication');
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-red-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Processing Authentication
            </h2>
            <p className="text-gray-600">
              Please wait while we complete your {platform} authentication...
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Authentication Successful!
            </h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <p className="text-sm text-gray-500">
              Redirecting you back to SpotiTube...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-12 h-12 mx-auto mb-4 text-red-600" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Authentication Failed
            </h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <button
              onClick={() => router.push('/')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Return to SpotiTube
            </button>
          </>
        )}
      </div>
    </div>
  );
} 