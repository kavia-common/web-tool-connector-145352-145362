'use client';

import React, { useState, useEffect } from 'react';
import { ConnectionResponse, AuthMethod } from '@/types/api';

interface ConnectionStatusProps {
  connection: ConnectionResponse;
  oauthConnection?: ConnectionResponse | null;
  onTestConnection: (useOAuth?: boolean) => void;
  onDisconnect: (authMethod: AuthMethod) => void;
  onSwitchAuth: (authMethod: AuthMethod) => void;
  isLoading: boolean;
  availableAuthMethods: AuthMethod[];
}

// PUBLIC_INTERFACE
export default function ConnectionStatus({ 
  connection, 
  oauthConnection,
  onTestConnection, 
  onDisconnect,
  onSwitchAuth,
  isLoading,
  availableAuthMethods = ['api_token']
}: ConnectionStatusProps) {
  /**
   * Enhanced component for displaying connection status with OAuth support
   */
  const [activeAuth, setActiveAuth] = useState<AuthMethod>('api_token');
  const [showDetails, setShowDetails] = useState(false);

  // Determine active authentication method
  useEffect(() => {
    if (oauthConnection?.status === 'connected') {
      setActiveAuth('oauth');
    } else if (connection?.status === 'connected') {
      setActiveAuth(connection.username?.includes('@') ? 'api_token' : 'basic');
    }
  }, [connection, oauthConnection]);

  const getActiveConnection = () => {
    return activeAuth === 'oauth' ? oauthConnection : connection;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return '✅';
      case 'testing': return '🔄';
      case 'error': return '❌';
      default: return '⚪';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600 bg-green-50 border-green-200';
      case 'testing': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getAuthMethodLabel = (method: AuthMethod) => {
    switch (method) {
      case 'oauth': return 'OAuth 2.0';
      case 'api_token': return 'API Token';
      case 'basic': return 'Basic Auth';
      default: return method;
    }
  };

  const getAuthMethodIcon = (method: AuthMethod) => {
    switch (method) {
      case 'oauth': return '🔐';
      case 'api_token': return '🔑';
      case 'basic': return '👤';
      default: return '🔒';
    }
  };

  const activeConnection = getActiveConnection();
  const serviceName = connection.service_type === 'jira' ? 'JIRA' : 'Confluence';
  const serviceIcon = connection.service_type === 'jira' ? '🎯' : '📚';

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">{serviceIcon}</span>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {serviceName} Connection
            </h2>
            <p className="text-gray-600">
              {getAuthMethodLabel(activeAuth)} Authentication
            </p>
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
        </div>
      </div>

      {/* Connection Status */}
      <div className={`p-4 rounded-lg border-2 mb-6 ${getStatusColor(activeConnection?.status || 'disconnected')}`}>
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{getStatusIcon(activeConnection?.status || 'disconnected')}</span>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">
              {activeConnection?.status === 'connected' ? 'Connected' : 
               activeConnection?.status === 'testing' ? 'Testing Connection...' :
               activeConnection?.status === 'error' ? 'Connection Error' : 'Not Connected'}
            </h3>
            <p className="text-sm opacity-90">
              {activeConnection?.message || 'No connection established'}
            </p>
          </div>
        </div>
      </div>

      {/* Authentication Method Switcher */}
      {availableAuthMethods.length > 1 && (
        <div className="mb-6">
          <h3 className="font-semibold text-gray-700 mb-3">Available Authentication Methods</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {availableAuthMethods.map((method) => {
              const isActive = method === activeAuth;
              const hasConnection = method === 'oauth' ? oauthConnection?.status === 'connected' : connection?.status === 'connected';
              
              return (
                <div
                  key={method}
                  onClick={() => !isActive && hasConnection && onSwitchAuth(method)}
                  className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    isActive
                      ? 'border-blue-600 bg-blue-50'
                      : hasConnection
                      ? 'border-green-300 bg-green-50 hover:border-green-400'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getAuthMethodIcon(method)}</span>
                    <div>
                      <p className="font-medium text-sm">{getAuthMethodLabel(method)}</p>
                      <p className="text-xs text-gray-600">
                        {isActive ? 'Active' : hasConnection ? 'Available' : 'Not configured'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Connection Details */}
      {showDetails && activeConnection && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-3">Connection Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Service:</span>
              <span className="font-medium">{serviceName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Authentication:</span>
              <span className="font-medium">{getAuthMethodLabel(activeAuth)}</span>
            </div>
            {activeConnection.base_url && (
              <div className="flex justify-between">
                <span className="text-gray-600">URL:</span>
                <span className="font-medium break-all">{activeConnection.base_url}</span>
              </div>
            )}
            {activeConnection.username && (
              <div className="flex justify-between">
                <span className="text-gray-600">User:</span>
                <span className="font-medium">{activeConnection.username}</span>
              </div>
            )}
            {activeConnection.connected_at && (
              <div className="flex justify-between">
                <span className="text-gray-600">Connected:</span>
                <span className="font-medium">
                  {new Date(activeConnection.connected_at).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => onTestConnection(activeAuth === 'oauth')}
          disabled={isLoading}
          className={`btn-secondary flex items-center space-x-2 ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoading && <div className="spinner"></div>}
          <span>{isLoading ? 'Testing...' : 'Test Connection'}</span>
        </button>

        <button
          onClick={() => onDisconnect(activeAuth)}
          disabled={isLoading}
          className={`btn-danger flex items-center space-x-2 ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <span>Disconnect {getAuthMethodLabel(activeAuth)}</span>
        </button>
      </div>

      {/* OAuth Note */}
      {activeAuth === 'oauth' && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>🔐 Secure OAuth Connection:</strong> Your connection is secured using OAuth 2.0. 
            No passwords are stored, and tokens can be revoked at any time from your Atlassian account.
          </p>
        </div>
      )}
    </div>
  );
}
