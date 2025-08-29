import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const DashboardContent = () => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const loadContent = async () => {
      try {
        setLoading(true);
        const path = location.pathname;
        let page = 'home';
        
        if (path !== '/' && path !== '/dashboard' && path !== '/home') {
          page = path.startsWith('/') ? path.substring(1) : path;
        }
        
        // Add .html if not present
        if (!page.endsWith('.html')) {
          page += '.html';
        }
        
        const response = await fetch(`/financial/${page}`);
        
        if (!response.ok) {
          throw new Error(`Failed to load ${page}`);
        }
        
        const html = await response.text();
        setContent(html);
        setError(null);
      } catch (err) {
        console.error('Error loading dashboard:', err);
        setError(`Failed to load dashboard: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-red-500 p-4">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Error Loading Dashboard</h2>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="dashboard-content"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default DashboardContent;
