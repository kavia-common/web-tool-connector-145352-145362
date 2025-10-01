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
   * Enhanced sidebar navigation component with Ocean Professional theme
   */
  const connectors = [
    {
      type: 'jira' as ServiceType,
      name: 'JIRA',
      icon: '🎯',
      description: 'Project Management',
      gradient: 'from-blue-600 to-blue-700',
      hoverGradient: 'hover:from-blue-700 hover:to-blue-800'
    },
    {
      type: 'confluence' as ServiceType,
      name: 'Confluence',
      icon: '📚',
      description: 'Documentation & Wiki',
      gradient: 'from-purple-600 to-purple-700',
      hoverGradient: 'hover:from-purple-700 hover:to-purple-800'
    }
  ];

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
      case 'connected': return 'text-green-600 bg-green-100';
      case 'testing': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected': return 'Connected';
      case 'testing': return 'Testing...';
      case 'error': return 'Error';
      default: return 'Not Connected';
    }
  };

  return (
    <div className="sidebar w-80 h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">O</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Ocean Professional</h1>
            <p className="text-gray-600 text-sm">Connector Dashboard</p>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-900/10 to-amber-600/10 p-3 rounded-lg">
          <p className="text-sm text-gray-700">
            Secure connections to your Atlassian tools
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <span className="mr-2">🔗</span>
            Available Connectors
          </h2>
          
          <div className="space-y-3">
            {connectors.map((connector) => {
              const isSelected = selectedConnector === connector.type;
              const status = connectionStatuses[connector.type] || 'disconnected';
              
              return (
                <div
                  key={connector.type}
                  onClick={() => onSelectConnector(connector.type)}
                  className={`
                    relative p-4 rounded-xl cursor-pointer transition-all duration-300 group
                    ${isSelected 
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 shadow-md' 
                      : 'bg-white border border-gray-200 hover:border-blue-300 hover:shadow-lg'
                    }
                  `}
                >
                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-600 to-purple-600 rounded-r-full"></div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`
                        w-12 h-12 rounded-lg flex items-center justify-center text-2xl
                        ${isSelected 
                          ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg' 
                          : 'bg-gray-100 group-hover:bg-gray-200'
                        }
                        transition-all duration-300
                      `}>
                        {connector.icon}
                      </div>
                      <div>
                        <h3 className={`font-semibold ${isSelected ? 'text-blue-800' : 'text-gray-800'}`}>
                          {connector.name}
                        </h3>
                        <p className="text-sm text-gray-600">{connector.description}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`
                        inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium
                        ${getStatusColor(status)}
                      `}>
                        <span>{getStatusIcon(status)}</span>
                        <span>{getStatusText(status)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Hover Effect */}
                  <div className={`
                    absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300
                    ${!isSelected ? 'bg-gradient-to-r from-blue-500/5 to-purple-500/5' : ''}
                  `}></div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Connection Summary */}
        <div className="bg-gradient-to-r from-blue-900/5 to-amber-600/5 p-4 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
            <span className="mr-2">📊</span>
            Connection Summary
          </h3>
          <div className="space-y-2">
            {connectors.map((connector) => {
              const status = connectionStatuses[connector.type];
              return (
                <div key={connector.type} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{connector.name}</span>
                  <span className={`font-medium ${
                    status === 'connected' ? 'text-green-600' : 
                    status === 'error' ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {getStatusText(status)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-gray-100">
        <div className="bg-gradient-to-r from-blue-900/10 to-amber-600/10 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
            <span className="mr-2">💡</span>
            Quick Start
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Select a connector to configure your connection. OAuth 2.0 provides the most secure authentication method.
          </p>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Ocean Professional v1.0.0
          </p>
        </div>
      </div>
    </div>
  );
}
