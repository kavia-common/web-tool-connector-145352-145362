import {
  HealthResponse,
  CredentialsRequest,
  ConnectionResponse,
  ConnectionTestRequest,
  ProjectsResponse,
  ServiceType,
  OAuthInitRequest,
  OAuthInitResponse,
  OAuthCallbackRequest,
  OAuthStatus
} from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://vscode-internal-41570-beta.beta01.cloud.kavia.ai:3001';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  // PUBLIC_INTERFACE
  async healthCheck(): Promise<HealthResponse> {
    /**
     * Check if the backend service is healthy
     */
    const response = await fetch(`${this.baseUrl}/health`);
    if (!response.ok) {
      throw new Error('Health check failed');
    }
    return response.json();
  }

  // PUBLIC_INTERFACE
  async storeCredentials(credentials: CredentialsRequest): Promise<ConnectionResponse> {
    /**
     * Store user credentials for JIRA or Confluence
     */
    const response = await fetch(`${this.baseUrl}/auth/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to store credentials');
    }
    
    return data;
  }

  // PUBLIC_INTERFACE
  async testConnection(request: ConnectionTestRequest, useOAuth: boolean = false): Promise<ConnectionResponse> {
    /**
     * Test connection to a service using stored credentials or OAuth
     */
    const url = new URL(`${this.baseUrl}/connections/test`);
    if (useOAuth) {
      url.searchParams.append('use_oauth', 'true');
    }

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Connection test failed');
    }
    
    return data;
  }

  // PUBLIC_INTERFACE
  async getAllConnectionStatus(): Promise<Record<ServiceType, ConnectionResponse>> {
    /**
     * Get connection status for all configured services
     */
    const response = await fetch(`${this.baseUrl}/connections/status`);
    
    if (!response.ok) {
      throw new Error('Failed to get connection status');
    }
    
    return response.json();
  }

  // PUBLIC_INTERFACE
  async getJiraProjects(useOAuth: boolean = false): Promise<ProjectsResponse> {
    /**
     * Fetch JIRA projects for authenticated user
     */
    const url = new URL(`${this.baseUrl}/projects/jira`);
    if (useOAuth) {
      url.searchParams.append('use_oauth', 'true');
    }

    const response = await fetch(url.toString());
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch JIRA projects');
    }
    
    return data;
  }

  // PUBLIC_INTERFACE
  async getConfluenceSpaces(useOAuth: boolean = false): Promise<ProjectsResponse> {
    /**
     * Fetch Confluence spaces for authenticated user
     */
    const url = new URL(`${this.baseUrl}/projects/confluence`);
    if (useOAuth) {
      url.searchParams.append('use_oauth', 'true');
    }

    const response = await fetch(url.toString());
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch Confluence spaces');
    }
    
    return data;
  }

  // PUBLIC_INTERFACE
  async deleteCredentials(serviceType: ServiceType): Promise<void> {
    /**
     * Delete stored credentials for a service
     */
    const response = await fetch(`${this.baseUrl}/auth/credentials/${serviceType}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to delete credentials');
    }
  }

  // OAuth Methods

  // PUBLIC_INTERFACE
  async initOAuthFlow(request: OAuthInitRequest): Promise<OAuthInitResponse> {
    /**
     * Initialize OAuth 2.0 authorization flow
     */
    const response = await fetch(`${this.baseUrl}/auth/oauth/init`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to initialize OAuth flow');
    }
    
    return data;
  }

  // PUBLIC_INTERFACE
  async handleOAuthCallback(request: OAuthCallbackRequest): Promise<ConnectionResponse> {
    /**
     * Handle OAuth callback and complete authentication
     */
    const response = await fetch(`${this.baseUrl}/auth/oauth/callback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'OAuth authentication failed');
    }
    
    return data;
  }

  // PUBLIC_INTERFACE
  async getOAuthStatus(): Promise<OAuthStatus> {
    /**
     * Get OAuth authentication status for all services
     */
    const response = await fetch(`${this.baseUrl}/auth/oauth/status`);
    
    if (!response.ok) {
      throw new Error('Failed to get OAuth status');
    }
    
    return response.json();
  }

  // PUBLIC_INTERFACE
  async revokeOAuthTokens(serviceType: ServiceType): Promise<void> {
    /**
     * Revoke OAuth tokens for a service
     */
    const response = await fetch(`${this.baseUrl}/auth/oauth/${serviceType}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to revoke OAuth tokens');
    }
  }
}

export const apiClient = new ApiClient();
