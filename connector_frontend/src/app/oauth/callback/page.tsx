'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiClient } from '@/services/api';

function OAuthCallbackContent() {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing OAuth authentication...');
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        if (error) {
          throw new Error(`OAuth error: ${error}`);
        }

        if (!code || !state) {
          throw new Error('Missing OAuth parameters');
        }

        // Verify state parameter
        const storedState = sessionStorage.getItem('oauth_state');
        if (state !== storedState) {
          throw new Error('Invalid OAuth state parameter');
        }

        // Complete OAuth flow
        const response = await apiClient.handleOAuthCallback({
          code,
          state
        });

        setStatus('success');
        setMessage(`Successfully authenticated with ${response.service_type}`);

        // Notify parent window
        if (window.opener) {
          window.opener.postMessage({
            type: 'OAUTH_SUCCESS',
            serviceType: response.service_type,
            response
          }, window.location.origin);
        }

        // Auto-close after short delay
        setTimeout(() => {
          window.close();
        }, 2000);

      } catch (error) {
        console.error('OAuth callback error:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'OAuth authentication failed');

        // Notify parent window of error
        if (window.opener) {
          window.opener.postMessage({
            type: 'OAUTH_ERROR',
            error: error instanceof Error ? error.message : 'OAuth authentication failed'
          }, window.location.origin);
        }

        // Auto-close after delay even on error
        setTimeout(() => {
          window.close();
        }, 3000);
      }
    };

    handleOAuthCallback();
  }, [searchParams]);

  const getStatusIcon = () => {
    switch (status) {
      case 'processing': return '🔄';
      case 'success': return '✅';
      case 'error': return '❌';
      default: return '🔄';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'processing': return 'text-blue-600';
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      default: return 'text-blue-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="card p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <span className="text-6xl mb-4 block">{getStatusIcon()}</span>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            OAuth Authentication
          </h1>
        </div>

        <div className={`text-lg font-semibold mb-4 ${getStatusColor()}`}>
          {message}
        </div>

        {status === 'processing' && (
          <div className="flex justify-center">
            <div className="spinner"></div>
          </div>
        )}

        {status === 'success' && (
          <p className="text-gray-600 text-sm">
            This window will close automatically...
          </p>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <p className="text-gray-600 text-sm">
              Please close this window and try again.
            </p>
            <button
              onClick={() => window.close()}
              className="btn-primary"
            >
              Close Window
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="card p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <span className="text-6xl mb-4 block">🔄</span>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Loading OAuth Callback
          </h1>
        </div>
        <div className="flex justify-center">
          <div className="spinner"></div>
        </div>
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
export default function OAuthCallback() {
  /**
   * OAuth callback page that handles OAuth redirects and completes authentication
   */
  return (
    <Suspense fallback={<LoadingFallback />}>
      <OAuthCallbackContent />
    </Suspense>
  );
}
