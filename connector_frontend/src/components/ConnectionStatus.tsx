'use client';

import React from 'react';
import { ConnectionResponse } from '@/types/api';

interface ConnectionStatusProps {
  connection: ConnectionResponse;
  onTestConnection: () => void;
  onDisconnect: () => void;
  isLoading: boolean;
}

// PUBLIC_INTERFACE
export default function ConnectionStatus({ 
  connection, 
  onTestConnection, 
  onDisconnect, 
  isLoading 
}: ConnectionStatusProps) {
  /**
   * Component to display connection status and actions
   */
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return '✅';
      case 'disconnected':
        return '❌';
      case 'testing':
        return '🔄';
      case 'error':
        return '⚠️';
      default:
        return '❓';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'disconnected':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'testing':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const serviceName = connection.service_type === 'jira' ? 'JIRA' : 'Confluence';

  return (
    <div className="card p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {serviceName} Connection Status
        </h2>
      </div>

      <div className={`p-6 rounded-lg border-2 ${getStatusColor(connection.status)} mb-6`}>
        <div className="flex items-center space-x-3 mb-4">
          <span className="text-2xl">{getStatusIcon(connection.status)}</span>
          <div>
            <h3 className="text-lg font-semibold capitalize">
              {connection.status.replace('_', ' ')}
            </h3>
            <p className="text-sm opacity-75">{connection.message}</p>
          </div>
        </div>

        {connection.base_url && (
          <div className="text-sm space-y-1">
            <p><span className="font-medium">Instance:</span> {connection.base_url}</p>
            {connection.username && (
              <p><span className="font-medium">User:</span> {connection.username}</p>
            )}
            {connection.connected_at && (
              <p><span className="font-medium">Connected:</span> {new Date(connection.connected_at).toLocaleString()}</p>
            )}
          </div>
        )}
      </div>

      <div className="flex space-x-4">
        <button
          onClick={onTestConnection}
          disabled={isLoading}
          className={`btn-secondary flex items-center space-x-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading && <div className="spinner"></div>}
          <span>{isLoading ? 'Testing...' : 'Test Connection'}</span>
        </button>

        {connection.status === 'connected' && (
          <button
            onClick={onDisconnect}
            disabled={isLoading}
            className={`btn-danger ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Disconnect
          </button>
        )}
      </div>
    </div>
  );
}
