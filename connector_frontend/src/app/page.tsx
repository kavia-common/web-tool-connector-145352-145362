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
  ProjectData,
  ConnectionStatus as ConnectionStatusType,
  AuthMethod,
  EnhancedConnectionState,
  OAuthStatus
} from '@/types/api';

interface ConnectionState {
  [key: string]: EnhancedConnectionState;
}

interface ProjectsState {
  [key: string]: ProjectData[];
}

export default function Home() {
  const [selectedConnector, setSelectedConnector] = useState<ServiceType | null>(null);
  const [connections, setConnections] = useState<ConnectionState>({});
  const [, setOauthStatus] = useState<OAuthStatus>({});
  const [projects, setProjects] = useState<ProjectsState>({});
  const [loading, setLoading] = useState({
    connection: false,
    projects: false,
    status: false,
    oauth: false,
  });
  const [error, setError] = useState<string | null>(null);

  // Load initial connection statuses and OAuth status
  useEffect(() => {
    const initializeConnections = async () => {
      await loadConnectionStatuses();
      await loadOAuthStatus();
    };
    initializeConnections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load projects when a connection becomes available
  useEffect(() => {
    const loadProjectsIfConnected = async () => {
      if (selectedConnector) {
        const connectionState = connections[selectedConnector];
        if (connectionState?.credentials_auth?.status === 'connected' || 
            connectionState?.oauth_auth?.status === 'connected') {
          await loadProjects(selectedConnector);
        }
      }
    };
    loadProjectsIfConnected();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConnector, connections]);

  const loadConnectionStatuses = async () => {
    try {
      setLoading(prev => ({ ...prev, status: true }));
      const statuses = await apiClient.getAllConnectionStatus();
      
      // Transform to enhanced connection state
      const enhancedConnections: ConnectionState = {};
      Object.entries(statuses).forEach(([serviceType, response]) => {
        enhancedConnections[serviceType] = {
          credentials_auth: response,
          oauth_auth: null,
          preferred_auth: 'api_token'
        };
      });
      
      setConnections(enhancedConnections);
    } catch (err) {
      console.error('Failed to load connection statuses:', err);
    } finally {
      setLoading(prev => ({ ...prev, status: false }));
    }
  };

  const loadOAuthStatus = async () => {
    try {
      setLoading(prev => ({ ...prev, oauth: true }));
      const status = await apiClient.getOAuthStatus();
      setOauthStatus(status);

      // Update connections with OAuth status
      const updatedConnections = { ...connections };
      Object.entries(status).forEach(([serviceType, oauthInfo]) => {
        if (!updatedConnections[serviceType]) {
          updatedConnections[serviceType] = {
            credentials_auth: null,
            oauth_auth: null,
            preferred_auth: 'oauth'
          };
        }
        
        if (oauthInfo.authenticated) {
          updatedConnections[serviceType].oauth_auth = {
            service_type: serviceType as ServiceType,
            status: 'connected' as ConnectionStatusType,
            message: 'Connected via OAuth',
            username: oauthInfo.user_info?.email,
            connected_at: oauthInfo.expires_at
          };
          updatedConnections[serviceType].preferred_auth = 'oauth';
        }
      });

      setConnections(updatedConnections);
    } catch (err) {
      console.error('Failed to load OAuth status:', err);
    } finally {
      setLoading(prev => ({ ...prev, oauth: false }));
    }
  };

  const handleStoreCredentials = async (credentials: CredentialsRequest) => {
    try {
      setLoading(prev => ({ ...prev, connection: true }));
      setError(null);
      
      const response = await apiClient.storeCredentials(credentials);
      
      setConnections(prev => ({
        ...prev,
        [credentials.service_type]: {
          ...prev[credentials.service_type],
          credentials_auth: response,
          preferred_auth: credentials.auth_method
        }
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

  const handleOAuthSuccess = async (serviceType: ServiceType) => {
    try {
      setLoading(prev => ({ ...prev, connection: true }));
      setError(null);
      
      // Reload OAuth status to get the new connection
      await loadOAuthStatus();
      await loadProjects(serviceType);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OAuth connection failed');
    } finally {
      setLoading(prev => ({ ...prev, connection: false }));
    }
  };

  const handleTestConnection = async (serviceType: ServiceType, useOAuth: boolean = false) => {
    try {
      setLoading(prev => ({ ...prev, connection: true }));
      setError(null);
      
      const response = await apiClient.testConnection({ service_type: serviceType }, useOAuth);
      
      const authKey = useOAuth ? 'oauth_auth' : 'credentials_auth';
      setConnections(prev => ({
        ...prev,
        [serviceType]: {
          ...prev[serviceType],
          [authKey]: response
        }
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

  const handleDisconnect = async (serviceType: ServiceType, authMethod: AuthMethod) => {
    try {
      setLoading(prev => ({ ...prev, connection: true }));
      setError(null);
      
      if (authMethod === 'oauth') {
        await apiClient.revokeOAuthTokens(serviceType);
        setConnections(prev => ({
          ...prev,
          [serviceType]: {
            ...prev[serviceType],
            oauth_auth: null
          }
        }));
      } else {
        await apiClient.deleteCredentials(serviceType);
        setConnections(prev => ({
          ...prev,
          [serviceType]: {
            ...prev[serviceType],
            credentials_auth: null
          }
        }));
      }

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

  const handleSwitchAuth = (serviceType: ServiceType, authMethod: AuthMethod) => {
    setConnections(prev => ({
      ...prev,
      [serviceType]: {
        ...prev[serviceType],
        preferred_auth: authMethod
      }
    }));
  };

  const loadProjects = async (serviceType: ServiceType) => {
    try {
      setLoading(prev => ({ ...prev, projects: true }));
      setError(null);
      
      const connectionState = connections[serviceType];
      const useOAuth = connectionState?.preferred_auth === 'oauth' && 
                       connectionState?.oauth_auth?.status === 'connected';
      
      let response;
      if (serviceType === 'jira') {
        response = await apiClient.getJiraProjects(useOAuth);
      } else {
        response = await apiClient.getConfluenceSpaces(useOAuth);
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
      jira: getServiceStatus('jira'),
      confluence: getServiceStatus('confluence'),
    };
  };

  const getServiceStatus = (serviceType: ServiceType): string => {
    const connectionState = connections[serviceType];
    if (!connectionState) return 'disconnected';

    if (connectionState.oauth_auth?.status === 'connected') return 'connected';
    if (connectionState.credentials_auth?.status === 'connected') return 'connected';
    if (connectionState.oauth_auth?.status === 'testing' || 
        connectionState.credentials_auth?.status === 'testing') return 'testing';
    if (connectionState.oauth_auth?.status === 'error' || 
        connectionState.credentials_auth?.status === 'error') return 'error';
    
    return 'disconnected';
  };

  const getAvailableAuthMethods = (serviceType: ServiceType): AuthMethod[] => {
    const connectionState = connections[serviceType];
    if (!connectionState) return ['oauth', 'api_token'];

    const methods: AuthMethod[] = [];
    if (connectionState.oauth_auth?.status === 'connected') methods.push('oauth');
    if (connectionState.credentials_auth?.status === 'connected') {
      const isApiToken = connectionState.credentials_auth.username?.includes('@');
      methods.push(isApiToken ? 'api_token' : 'basic');
    }

    return methods.length > 0 ? methods : ['oauth', 'api_token'];
  };

  const renderMainContent = () => {
    if (!selectedConnector) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-2xl">
            <div className="text-8xl mb-6">🔗</div>
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Welcome to Ocean Professional
            </h2>
            <div className="text-xl text-gray-600 mb-8 leading-relaxed">
              <p className="mb-4">
                Your professional gateway to JIRA and Confluence integration.
              </p>
              <p>
                Select a connector from the sidebar to start connecting to your 
                Atlassian services with secure OAuth or API token authentication.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="p-6 bg-gradient-to-r from-blue-900/10 to-amber-600/10 rounded-lg">
                <span className="text-4xl mb-3 block">🎯</span>
                <h3 className="font-semibold text-lg mb-2">JIRA Integration</h3>
                <p className="text-gray-600">Connect to your JIRA instance to manage projects, issues, and workflows.</p>
              </div>
              <div className="p-6 bg-gradient-to-r from-blue-900/10 to-amber-600/10 rounded-lg">
                <span className="text-4xl mb-3 block">📚</span>
                <h3 className="font-semibold text-lg mb-2">Confluence Integration</h3>
                <p className="text-gray-600">Access your Confluence spaces, pages, and documentation.</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const connectionState = connections[selectedConnector];
    const isConnected = getServiceStatus(selectedConnector) === 'connected';
    const currentProjects = projects[selectedConnector] || [];
    const availableAuthMethods = getAvailableAuthMethods(selectedConnector);

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
            onOAuthSuccess={handleOAuthSuccess}
            isLoading={loading.connection}
          />
        ) : (
          <>
            <ConnectionStatus
              connection={connectionState?.credentials_auth || {
                service_type: selectedConnector,
                status: 'disconnected' as ConnectionStatusType,
                message: 'Not connected'
              }}
              oauthConnection={connectionState?.oauth_auth}
              onTestConnection={(useOAuth) => handleTestConnection(selectedConnector, useOAuth)}
              onDisconnect={(authMethod) => handleDisconnect(selectedConnector, authMethod)}
              onSwitchAuth={(authMethod) => handleSwitchAuth(selectedConnector, authMethod)}
              isLoading={loading.connection}
              availableAuthMethods={availableAuthMethods}
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
