import React, { useEffect } from 'react';

const HomeDashboard = () => {
  useEffect(() => {
    // Redirect directly to the HTML file
    console.log('Redirecting to financial dashboard...');
    window.location.href = '/financial/home.html';
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-white text-lg">Redirecting to Financial Dashboard...</p>
        <p className="text-gray-400 text-sm mt-2">
          If redirect doesn't work, <a href="/financial/home.html" className="text-blue-400 hover:underline">click here</a>
        </p>
      </div>
    </div>
  );
};

export default HomeDashboard;