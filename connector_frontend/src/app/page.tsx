'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import ConnectionForm from '@/components/ConnectionForm';
import ConnectionStatus from '@/components/ConnectionStatus';
import ProjectsList from '@/components/ProjectsList';
import { apiClient } from '@/services/api';
import {
  ServiceType,
  CredentialsRequest,
  ConnectionResponse,
  ProjectData,
  ConnectionStatus as ConnectionStatusType
} from '@/types/api';

interface ConnectionState {
  [key: string]: ConnectionResponse | null;
}

interface ProjectsState {
  [key: string]: ProjectData[];
}

export default function Home() {
  const [selectedConnector, setSelectedConnector] = useState<ServiceType | null>(null);
  const [connections, setConnections] = useState<ConnectionState>({});
  const [projects, setProjects] = useState<ProjectsState>({});
  const [loading, setLoading] = useState({
    connection: false,
    projects: false,
    status: false,
  });
  const [error, setError] = useState<string | null>(null);

  // Load initial connection statuses
  useEffect(() => {
    loadConnectionStatuses();
  }, []);

  // Load projects when a connection becomes available
  useEffect(() => {
    if (selectedConnector && connections[selectedConnector]?.status === 'connected') {
      loadProjects(selectedConnector);
    }
  }, [selectedConnector, connections]);

  const loadConnectionStatuses = async () => {
    try {
      setLoading(prev => ({ ...prev, status: true }));
      const statuses = await apiClient.getAllConnectionStatus();
      setConnections(statuses);
    } catch (err) {
      console.error('Failed to load connection statuses:', err);
    } finally {
      setLoading(prev => ({ ...prev, status: false }));
    }
  };

  const handleStoreCredentials = async (credentials: CredentialsRequest) => {
    try {
      setLoading(prev => ({ ...prev, connection: true }));
      setError(null);
      
      const response = await apiClient.storeCredentials(credentials);
      
      setConnections(prev => ({
        ...prev,
        [credentials.service_type]: response
      }));

      // If connection is successful, load projects
      if (response.status === 'connected') {
        await loadProjects(credentials.service_type);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to store credentials');
    } finally {
      setLoading(prev => ({ ...prev, connection: false }));
    }
  };

  const handleTestConnection = async (serviceType: ServiceType) => {
    try {
      setLoading(prev => ({ ...prev, connection: true }));
      setError(null);
      
      const response = await apiClient.testConnection({ service_type: serviceType });
      
      setConnections(prev => ({
        ...prev,
        [serviceType]: response
      }));

      if (response.status === 'connected') {
        await loadProjects(serviceType);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection test failed');
    } finally {
      setLoading(prev => ({ ...prev, connection: false }));
    }
  };

  const handleDisconnect = async (serviceType: ServiceType) => {
    try {
      setLoading(prev => ({ ...prev, connection: true }));
      setError(null);
      
      await apiClient.deleteCredentials(serviceType);
      
      setConnections(prev => ({
        ...prev,
        [serviceType]: {
          service_type: serviceType,
          status: 'disconnected' as ConnectionStatusType,
          message: 'Disconnected successfully'
        }
      }));

      // Clear projects for this service
      setProjects(prev => ({
        ...prev,
        [serviceType]: []
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect');
    } finally {
      setLoading(prev => ({ ...prev, connection: false }));
    }
  };

  const loadProjects = async (serviceType: ServiceType) => {
    try {
      setLoading(prev => ({ ...prev, projects: true }));
      setError(null);
      
      let response;
      if (serviceType === 'jira') {
        response = await apiClient.getJiraProjects();
      } else {
        response = await apiClient.getConfluenceSpaces();
      }
      
      setProjects(prev => ({
        ...prev,
        [serviceType]: response.projects
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to load ${serviceType} projects`);
    } finally {
      setLoading(prev => ({ ...prev, projects: false }));
    }
  };

  const getConnectionStatuses = (): Record<ServiceType, string> => {
    return {
      jira: connections.jira?.status || 'disconnected',
      confluence: connections.confluence?.status || 'disconnected',
    };
  };

  const renderMainContent = () => {
    if (!selectedConnector) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🔗</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Welcome to Ocean Professional
            </h2>
            <p className="text-gray-600 max-w-md">
              Select a connector from the sidebar to start connecting to your JIRA or Confluence instance.
            </p>
          </div>
        </div>
      );
    }

    const connection = connections[selectedConnector];
    const isConnected = connection?.status === 'connected';
    const currentProjects = projects[selectedConnector] || [];

    return (
      <div className="flex-1 p-8 space-y-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <span>⚠️</span>
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {!isConnected ? (
          <ConnectionForm
            serviceType={selectedConnector}
            onSubmit={handleStoreCredentials}
            isLoading={loading.connection}
          />
        ) : (
          <>
            <ConnectionStatus
              connection={connection}
              onTestConnection={() => handleTestConnection(selectedConnector)}
              onDisconnect={() => handleDisconnect(selectedConnector)}
              isLoading={loading.connection}
            />
            
            <ProjectsList
              projects={currentProjects}
              serviceType={selectedConnector}
              isLoading={loading.projects}
              onRefresh={() => loadProjects(selectedConnector)}
            />
          </>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        selectedConnector={selectedConnector}
        onSelectConnector={setSelectedConnector}
        connectionStatuses={getConnectionStatuses()}
      />
      {renderMainContent()}
    </div>
  );
}
