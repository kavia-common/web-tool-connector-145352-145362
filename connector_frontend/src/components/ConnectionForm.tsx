'use client';

import React, { useState } from 'react';
import { ServiceType, AuthMethod, CredentialsRequest } from '@/types/api';

interface ConnectionFormProps {
  serviceType: ServiceType;
  onSubmit: (credentials: CredentialsRequest) => Promise<void>;
  isLoading: boolean;
}

// PUBLIC_INTERFACE
export default function ConnectionForm({ serviceType, onSubmit, isLoading }: ConnectionFormProps) {
  /**
   * Form component for entering connection credentials
   */
  const [formData, setFormData] = useState({
    base_url: '',
    username: '',
    password: '',
    auth_method: 'basic' as AuthMethod,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const credentials: CredentialsRequest = {
      service_type: serviceType,
      base_url: formData.base_url.trim(),
      auth_method: formData.auth_method,
      username: formData.username.trim(),
      password: formData.password.trim(),
    };

    await onSubmit(credentials);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const serviceName = serviceType === 'jira' ? 'JIRA' : 'Confluence';
  const placeholderUrl = serviceType === 'jira' 
    ? 'https://yourcompany.atlassian.net' 
    : 'https://yourcompany.atlassian.net/wiki';

  return (
    <div className="card p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Connect to {serviceName}
        </h2>
        <p className="text-gray-600">
          Enter your {serviceName} credentials to establish a connection
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="form-label">
            {serviceName} Instance URL
          </label>
          <input
            type="url"
            value={formData.base_url}
            onChange={(e) => handleInputChange('base_url', e.target.value)}
            placeholder={placeholderUrl}
            className={`form-input ${errors.base_url ? 'border-red-500' : ''}`}
            disabled={isLoading}
          />
          {errors.base_url && (
            <p className="text-red-500 text-sm mt-1">{errors.base_url}</p>
          )}
        </div>

        <div>
          <label className="form-label">
            Authentication Method
          </label>
          <select
            value={formData.auth_method}
            onChange={(e) => handleInputChange('auth_method', e.target.value)}
            className="form-input"
            disabled={isLoading}
          >
            <option value="basic">Basic Authentication</option>
            <option value="api_token">API Token</option>
          </select>
        </div>

        <div>
          <label className="form-label">
            {formData.auth_method === 'api_token' ? 'Email' : 'Username'}
          </label>
          <input
            type={formData.auth_method === 'api_token' ? 'email' : 'text'}
            value={formData.username}
            onChange={(e) => handleInputChange('username', e.target.value)}
            placeholder={formData.auth_method === 'api_token' ? 'your.email@company.com' : 'username'}
            className={`form-input ${errors.username ? 'border-red-500' : ''}`}
            disabled={isLoading}
          />
          {errors.username && (
            <p className="text-red-500 text-sm mt-1">{errors.username}</p>
          )}
        </div>

        <div>
          <label className="form-label">
            {formData.auth_method === 'api_token' ? 'API Token' : 'Password'}
          </label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            placeholder={formData.auth_method === 'api_token' ? 'Your API token' : 'Your password'}
            className={`form-input ${errors.password ? 'border-red-500' : ''}`}
            disabled={isLoading}
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
          )}
          {formData.auth_method === 'api_token' && (
            <p className="text-sm text-gray-500 mt-1">
              Create an API token in your Atlassian account settings
            </p>
          )}
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={isLoading}
            className={`btn-primary flex items-center space-x-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading && <div className="spinner"></div>}
            <span>{isLoading ? 'Connecting...' : 'Connect'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
