'use client';

import React, { useState, useEffect } from 'react';
import { ServiceType, AuthMethod, CredentialsRequest, OAuthInitRequest } from '@/types/api';
import { apiClient } from '@/services/api';

interface ConnectionFormProps {
  serviceType: ServiceType;
  onSubmit: (credentials: CredentialsRequest) => Promise<void>;
  onOAuthSuccess: (serviceType: ServiceType) => void;
  isLoading: boolean;
}

// PUBLIC_INTERFACE
export default function ConnectionForm({ serviceType, onSubmit, onOAuthSuccess, isLoading }: ConnectionFormProps) {
  /**
   * Enhanced form component for entering connection credentials with OAuth support
   */
  const [authMethod, setAuthMethod] = useState<AuthMethod>('api_token');
  const [formData, setFormData] = useState({
    base_url: '',
    username: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [oauthLoading, setOauthLoading] = useState(false);

  // Auto-fill common Atlassian URLs
  useEffect(() => {
    if (!formData.base_url) {
      const defaultUrl = serviceType === 'jira' 
        ? 'https://yourcompany.atlassian.net'
        : 'https://yourcompany.atlassian.net/wiki';
      setFormData(prev => ({ ...prev, base_url: defaultUrl }));
    }
  }, [serviceType, formData.base_url]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (authMethod !== 'oauth') {
      if (!formData.base_url.trim()) {
        newErrors.base_url = 'Base URL is required';
      } else if (!isValidUrl(formData.base_url)) {
        newErrors.base_url = 'Please enter a valid URL';
      }

      if (!formData.username.trim()) {
        newErrors.username = 'Username/Email is required';
      }

      if (!formData.password.trim()) {
        newErrors.password = 'Password/API Token is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleCredentialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const credentials: CredentialsRequest = {
      service_type: serviceType,
      base_url: formData.base_url.trim(),
      auth_method: authMethod,
      username: formData.username.trim(),
      password: formData.password.trim(),
    };

    await onSubmit(credentials);
  };

  const handleOAuthFlow = async () => {
    try {
      setOauthLoading(true);
      setErrors({});

      const state = Math.random().toString(36).substring(2, 15);
      const oauthRequest: OAuthInitRequest = {
        service_type: serviceType,
        state: state
      };

      const response = await apiClient.initOAuthFlow(oauthRequest);
      
      // Store state in sessionStorage for verification
      sessionStorage.setItem('oauth_state', state);
      sessionStorage.setItem('oauth_service', serviceType);

      // Open OAuth popup
      const popup = window.open(
        response.auth_url,
        'oauth_popup',
        'width=600,height=700,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        throw new Error('Failed to open OAuth popup. Please allow popups for this site.');
      }

      // Listen for OAuth completion
      const messageListener = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;

        if (event.data.type === 'OAUTH_SUCCESS') {
          window.removeEventListener('message', messageListener);
          popup.close();
          onOAuthSuccess(serviceType);
        } else if (event.data.type === 'OAUTH_ERROR') {
          window.removeEventListener('message', messageListener);
          popup.close();
          setErrors({ oauth: event.data.error || 'OAuth authentication failed' });
        }
      };

      window.addEventListener('message', messageListener);

      // Check if popup was closed manually
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageListener);
          setOauthLoading(false);
        }
      }, 1000);

    } catch (err) {
      setErrors({ oauth: err instanceof Error ? err.message : 'OAuth initialization failed' });
    } finally {
      setOauthLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const serviceName = serviceType === 'jira' ? 'JIRA' : 'Confluence';
  const serviceIcon = serviceType === 'jira' ? '🎯' : '📚';

  return (
    <div className="card p-8">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <span className="text-4xl">{serviceIcon}</span>
          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              Connect to {serviceName}
            </h2>
            <p className="text-gray-600 mt-1">
              Choose your preferred authentication method
            </p>
          </div>
        </div>
      </div>

      {errors.oauth && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center space-x-2">
            <span>⚠️</span>
            <span>{errors.oauth}</span>
          </div>
        </div>
      )}

      {/* Authentication Method Selection */}
      <div className="mb-8">
        <label className="form-label mb-4">
          Authentication Method
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            onClick={() => setAuthMethod('oauth')}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              authMethod === 'oauth'
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🔐</span>
              <div>
                <h3 className="font-semibold">OAuth 2.0</h3>
                <p className="text-sm text-gray-600">Secure & Recommended</p>
              </div>
            </div>
          </div>

          <div
            onClick={() => setAuthMethod('api_token')}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              authMethod === 'api_token'
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🔑</span>
              <div>
                <h3 className="font-semibold">API Token</h3>
                <p className="text-sm text-gray-600">Email + Token</p>
              </div>
            </div>
          </div>

          <div
            onClick={() => setAuthMethod('basic')}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              authMethod === 'basic'
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">👤</span>
              <div>
                <h3 className="font-semibold">Basic Auth</h3>
                <p className="text-sm text-gray-600">Username + Password</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* OAuth Authentication */}
      {authMethod === 'oauth' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-900/10 to-amber-600/10 p-6 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">
              OAuth 2.0 Authentication
            </h3>
            <p className="text-gray-600 mb-4">
              Click the button below to securely authenticate with your {serviceName} account using OAuth 2.0. 
              This is the most secure method and doesn&apos;t require you to share your password.
            </p>
            <button
              type="button"
              onClick={handleOAuthFlow}
              disabled={oauthLoading || isLoading}
              className={`btn-primary flex items-center space-x-2 ${
                (oauthLoading || isLoading) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {oauthLoading && <div className="spinner"></div>}
              <span>
                {oauthLoading ? 'Connecting...' : `Connect with ${serviceName} OAuth`}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Credential-based Authentication */}
      {authMethod !== 'oauth' && (
        <form onSubmit={handleCredentialSubmit} className="space-y-6">
          <div>
            <label className="form-label">
              {serviceName} Instance URL
            </label>
            <input
              type="url"
              value={formData.base_url}
              onChange={(e) => handleInputChange('base_url', e.target.value)}
              placeholder={`https://yourcompany.atlassian.net${serviceType === 'confluence' ? '/wiki' : ''}`}
              className={`form-input ${errors.base_url ? 'border-red-500' : ''}`}
              disabled={isLoading}
            />
            {errors.base_url && (
              <p className="text-red-500 text-sm mt-1">{errors.base_url}</p>
            )}
          </div>

          <div>
            <label className="form-label">
              {authMethod === 'api_token' ? 'Email Address' : 'Username'}
            </label>
            <input
              type={authMethod === 'api_token' ? 'email' : 'text'}
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              placeholder={
                authMethod === 'api_token' 
                  ? 'your.email@company.com' 
                  : 'username'
              }
              className={`form-input ${errors.username ? 'border-red-500' : ''}`}
              disabled={isLoading}
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">{errors.username}</p>
            )}
          </div>

          <div>
            <label className="form-label">
              {authMethod === 'api_token' ? 'API Token' : 'Password'}
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder={
                authMethod === 'api_token' 
                  ? 'Your API token from Atlassian account settings' 
                  : 'Your password'
              }
              className={`form-input ${errors.password ? 'border-red-500' : ''}`}
              disabled={isLoading}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
            {authMethod === 'api_token' && (
              <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded">
                <p className="text-sm text-amber-800">
                  <strong>💡 How to get your API token:</strong><br />
                  1. Go to <a href="https://id.atlassian.com/manage-profile/security/api-tokens" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Atlassian Account Settings</a><br />
                  2. Click &quot;Create API token&quot;<br />
                  3. Copy and paste the token here
                </p>
              </div>
            )}
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={isLoading}
              className={`btn-primary flex items-center space-x-2 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading && <div className="spinner"></div>}
              <span>{isLoading ? 'Connecting...' : 'Connect'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Help Section */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-2">Need Help?</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• OAuth 2.0 is the most secure option and doesn&apos;t require sharing passwords</li>
          <li>• API tokens are safer than passwords for programmatic access</li>
          <li>• Make sure your {serviceName} instance URL is accessible</li>
          <li>• Check your firewall and network settings if connection fails</li>
        </ul>
      </div>
    </div>
  );
}
