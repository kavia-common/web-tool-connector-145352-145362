import {
  HealthResponse,
  CredentialsRequest,
  ConnectionResponse,
  ConnectionTestRequest,
  ProjectsResponse,
  ServiceType
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
  async testConnection(request: ConnectionTestRequest): Promise<ConnectionResponse> {
    /**
     * Test connection to a service using stored credentials
     */
    const response = await fetch(`${this.baseUrl}/connections/test`, {
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
  async getJiraProjects(): Promise<ProjectsResponse> {
    /**
     * Fetch JIRA projects for authenticated user
     */
    const response = await fetch(`${this.baseUrl}/projects/jira`);
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch JIRA projects');
    }
    
    return data;
  }

  // PUBLIC_INTERFACE
  async getConfluenceSpaces(): Promise<ProjectsResponse> {
    /**
     * Fetch Confluence spaces for authenticated user
     */
    const response = await fetch(`${this.baseUrl}/projects/confluence`);
    
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
}

export const apiClient = new ApiClient();
