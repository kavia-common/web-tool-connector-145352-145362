'use client';

import React from 'react';
import { ServiceType } from '@/types/api';

interface SidebarProps {
  selectedConnector: ServiceType | null;
  onSelectConnector: (connector: ServiceType) => void;
  connectionStatuses: Record<ServiceType, string>;
}

// PUBLIC_INTERFACE
export default function Sidebar({ selectedConnector, onSelectConnector, connectionStatuses }: SidebarProps) {
  /**
   * Sidebar navigation component for selecting connectors
   */
  const connectors = [
    {
      type: 'jira' as ServiceType,
      name: 'JIRA',
      icon: '🎯',
      description: 'Project Management'
    },
    {
      type: 'confluence' as ServiceType,
      name: 'Confluence',
      icon: '📚',
      description: 'Documentation'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'text-green-600';
      case 'disconnected':
        return 'text-red-600';
      case 'testing':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'disconnected':
        return 'Not Connected';
      case 'testing':
        return 'Testing...';
      case 'error':
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="sidebar w-80 h-full p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Ocean Professional</h1>
        <p className="text-gray-600 text-sm">Connector Dashboard</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Available Connectors</h2>
        
        {connectors.map((connector) => {
          const isSelected = selectedConnector === connector.type;
          const status = connectionStatuses[connector.type] || 'disconnected';
          
          return (
            <div
              key={connector.type}
              onClick={() => onSelectConnector(connector.type)}
              className={`nav-item p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                isSelected ? 'active bg-blue-50 border-l-4 border-blue-600' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{connector.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-800">{connector.name}</h3>
                    <p className="text-sm text-gray-600">{connector.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xs font-medium ${getStatusColor(status)}`}>
                    {getStatusText(status)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 p-4 bg-gradient-to-r from-blue-900/10 to-amber-600/10 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-2">Quick Start</h3>
        <p className="text-sm text-gray-600">
          Select a connector from the list to configure your connection and start accessing your projects.
        </p>
      </div>
    </div>
  );
}
