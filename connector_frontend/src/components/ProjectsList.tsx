'use client';

import React, { useState } from 'react';
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
   * Enhanced component for displaying projects/spaces with improved UI and functionality
   */
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'key' | 'type'>('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const serviceName = serviceType === 'jira' ? 'JIRA' : 'Confluence';
  const itemName = serviceType === 'jira' ? 'Projects' : 'Spaces';
  const serviceIcon = serviceType === 'jira' ? '🎯' : '📚';

  // Filter and sort projects
  const filteredProjects = projects
    .filter(project => 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'key':
          return a.key.localeCompare(b.key);
        case 'type':
          return (a.project_type || '').localeCompare(b.project_type || '');
        default:
          return 0;
      }
    });

  const handleProjectClick = (project: ProjectData) => {
    if (project.url) {
      window.open(project.url, '_blank', 'noopener,noreferrer');
    }
  };

  const renderProjectCard = (project: ProjectData) => (
    <div
      key={project.id}
      onClick={() => handleProjectClick(project)}
      className="card p-6 cursor-pointer transition-all duration-200 hover:shadow-lg group"
    >
      <div className="flex items-start space-x-4">
        {project.avatar_url ? (
          <div className="w-12 h-12 relative">
            <Image
              src={project.avatar_url}
              alt={`${project.name} avatar`}
              width={48}
              height={48}
              className="rounded-lg object-cover"
              onError={() => {
                // Handle error by hiding the image container
              }}
            />
          </div>
        ) : (
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            {project.key.charAt(0)}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="font-semibold text-gray-800 truncate group-hover:text-blue-600 transition-colors">
              {project.name}
            </h3>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              {project.key}
            </span>
          </div>
          
          {project.description && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {project.description}
            </p>
          )}
          
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            {project.project_type && (
              <span className="flex items-center space-x-1">
                <span>📋</span>
                <span className="capitalize">{project.project_type}</span>
              </span>
            )}
            {project.lead && (
              <span className="flex items-center space-x-1">
                <span>👤</span>
                <span>{project.lead.displayName || project.lead.name}</span>
              </span>
            )}
          </div>
        </div>

        <div className="text-gray-400 group-hover:text-blue-600 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </div>
      </div>
    </div>
  );

  const renderProjectRow = (project: ProjectData) => (
    <tr
      key={project.id}
      onClick={() => handleProjectClick(project)}
      className="cursor-pointer hover:bg-gray-50 transition-colors"
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center space-x-3">
          {project.avatar_url ? (
            <div className="w-8 h-8 relative">
              <Image
                src={project.avatar_url}
                alt={`${project.name} avatar`}
                width={32}
                height={32}
                className="rounded object-cover"
                onError={() => {
                  // Handle error by hiding the image container
                }}
              />
            </div>
          ) : (
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center text-white font-bold text-sm">
              {project.key.charAt(0)}
            </div>
          )}
          <div>
            <div className="font-medium text-gray-900">{project.name}</div>
            <div className="text-sm text-gray-500">{project.key}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <p className="text-sm text-gray-600 max-w-xs truncate">
          {project.description || 'No description available'}
        </p>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full capitalize">
          {project.project_type || 'Unknown'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {project.lead?.displayName || project.lead?.name || 'Unassigned'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-400">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </td>
    </tr>
  );

  return (
    <div className="card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <span className="text-3xl">{serviceIcon}</span>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {serviceName} {itemName}
            </h2>
            <p className="text-gray-600">
              {isLoading ? 'Loading...' : `${filteredProjects.length} of ${projects.length} ${itemName.toLowerCase()}`}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
              }`}
              title="Grid view"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
              }`}
              title="List view"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className={`btn-secondary flex items-center space-x-2 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading && <div className="spinner"></div>}
            <span>{isLoading ? 'Loading...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0 mb-6">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder={`Search ${itemName.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-10"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'key' | 'type')}
            className="form-input w-auto"
          >
            <option value="name">Name</option>
            <option value="key">Key</option>
            <option value="type">Type</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-gray-600">Loading {itemName.toLowerCase()}...</p>
          </div>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12">
          <span className="text-6xl mb-4 block">{serviceIcon}</span>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No {itemName} Found
          </h3>
          <p className="text-gray-600 mb-6">
            It looks like you don&apos;t have access to any {itemName.toLowerCase()} in this {serviceName} instance,
            or there might be a configuration issue.
          </p>
          <button
            onClick={onRefresh}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <span className="text-4xl mb-4 block">🔍</span>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No Results Found
          </h3>
          <p className="text-gray-600">
            No {itemName.toLowerCase()} match your search criteria. Try adjusting your search term.
          </p>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map(renderProjectCard)}
            </div>
          ) : (
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {itemName.slice(0, -1)}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lead
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProjects.map(renderProjectRow)}
                </tbody>
              </table>
            </div>
          )}

          {/* Results Summary */}
          <div className="mt-6 flex items-center justify-between text-sm text-gray-600">
            <p>
              Showing {filteredProjects.length} of {projects.length} {itemName.toLowerCase()}
            </p>
            {searchTerm && (
              <p>
                Filtered by: <span className="font-medium">&quot;{searchTerm}&quot;</span>
                <button
                  onClick={() => setSearchTerm('')}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  Clear
                </button>
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
