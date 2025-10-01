export interface HealthResponse {
  status: string;
  message: string;
  timestamp: string;
  version: string;
}

export interface ErrorResponse {
  error: string;
  message: string;
  details?: Record<string, unknown>;
}

export type ServiceType = 'jira' | 'confluence';
export type AuthMethod = 'basic' | 'api_token' | 'oauth';
export type ConnectionStatus = 'connected' | 'disconnected' | 'error' | 'testing';

export interface CredentialsRequest {
  service_type: ServiceType;
  base_url: string;
  auth_method: AuthMethod;
  username: string;
  password: string;
}

export interface ConnectionResponse {
  service_type: ServiceType;
  status: ConnectionStatus;
  message: string;
  base_url?: string;
  username?: string;
  connected_at?: string;
}

export interface ConnectionTestRequest {
  service_type: ServiceType;
}

export interface ProjectData {
  id: string;
  key: string;
  name: string;
  description?: string;
  project_type?: string;
  url?: string;
  avatar_url?: string;
  lead?: {
    displayName?: string;
    name?: string;
    [key: string]: unknown;
  };
}

export interface ProjectsResponse {
  service_type: ServiceType;
  projects: ProjectData[];
  total_count: number;
}

// OAuth-related types
export interface OAuthInitRequest {
  service_type: ServiceType;
  state?: string;
}

export interface OAuthInitResponse {
  auth_url: string;
  state: string;
}

export interface OAuthCallbackRequest {
  code: string;
  state: string;
}

export interface OAuthStatus {
  [key: string]: {
    authenticated: boolean;
    expires_at?: string;
    user_info?: {
      account_id?: string;
      email?: string;
      name?: string;
    };
  };
}

// Enhanced connection state
export interface EnhancedConnectionState {
  credentials_auth: ConnectionResponse | null;
  oauth_auth: ConnectionResponse | null;
  preferred_auth: AuthMethod;
}
