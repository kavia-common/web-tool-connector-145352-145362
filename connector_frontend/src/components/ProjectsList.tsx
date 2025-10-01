'use client';

import React from 'react';
import Image from 'next/image';
import { ProjectData, ServiceType } from '@/types/api';

interface ProjectsListProps {
  projects: ProjectData[];
  serviceType: ServiceType;
  isLoading: boolean;
  onRefresh: () => void;
}

// PUBLIC_INTERFACE
export default function ProjectsList({ projects, serviceType, isLoading, onRefresh }: ProjectsListProps) {
  /**
   * Component to display list of projects or spaces
   */
  const itemName = serviceType === 'jira' ? 'Projects' : 'Spaces';
  const serviceName = serviceType === 'jira' ? 'JIRA' : 'Confluence';

  return (
    <div className="card p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {serviceName} {itemName}
          </h2>
          <p className="text-gray-600">
            {projects.length} {itemName.toLowerCase()} found
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className={`btn-secondary flex items-center space-x-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading && <div className="spinner"></div>}
          <span>{isLoading ? 'Loading...' : 'Refresh'}</span>
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="spinner mr-3"></div>
          <span className="text-gray-600">Loading {itemName.toLowerCase()}...</span>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📂</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No {itemName} Found
          </h3>
          <p className="text-gray-600">
            No {itemName.toLowerCase()} are available or you don&apos;t have access to any {itemName.toLowerCase()}.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="card p-6 hover:shadow-lg transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-start space-x-4">
                {project.avatar_url ? (
                  <Image
                    src={project.avatar_url}
                    alt={`${project.name} avatar`}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-lg"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                    {project.name.charAt(0).toUpperCase()}
                  </div>
                )}
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {project.name}
                    </h3>
                    <span className="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {project.key}
                    </span>
                  </div>
                  
                  {project.description && (
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    {project.project_type && (
                      <span className="flex items-center space-x-1">
                        <span>Type:</span>
                        <span className="font-medium">{project.project_type}</span>
                      </span>
                    )}
                    {project.lead && (
                      <span className="flex items-center space-x-1">
                        <span>Lead:</span>
                        <span className="font-medium">
                          {project.lead.displayName || project.lead.name || 'Unknown'}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
                
                {project.url && (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
