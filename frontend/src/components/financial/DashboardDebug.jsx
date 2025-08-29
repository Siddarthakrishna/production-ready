import React, { useState } from 'react';

const DashboardDebug = () => {
  const [testMode, setTestMode] = useState(true);

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="p-4">
        <h1 className="text-2xl font-bold text-white mb-4">Dashboard Debug Tool</h1>
        <div className="mb-4 space-x-4">
          <button 
            onClick={() => setTestMode(true)}
            className={`px-4 py-2 rounded ${testMode ? 'bg-blue-600' : 'bg-gray-600'} text-white`}
          >
            Test Mode
          </button>
          <button 
            onClick={() => setTestMode(false)}
            className={`px-4 py-2 rounded ${!testMode ? 'bg-blue-600' : 'bg-gray-600'} text-white`}
          >
            Full Dashboard
          </button>
        </div>
        
        <div className="bg-gray-800 p-4 rounded mb-4">
          <h3 className="text-white text-lg mb-2">Debug Info:</h3>
          <p className="text-gray-300">Current URL: {window.location.href}</p>
          <p className="text-gray-300">Test URL: {window.location.origin}/financial/test.html</p>
          <p className="text-gray-300">Dashboard URL: {window.location.origin}/financial/home.html</p>
        </div>
      </div>

      <iframe
        src={testMode ? "/financial/test.html" : "/financial/home.html"}
        style={{
          width: '100%',
          height: 'calc(100vh - 200px)',
          border: '2px solid #4B5563',
          borderRadius: '8px',
          margin: '0 16px'
        }}
        title={testMode ? "Dashboard Test" : "Financial Dashboard"}
        onLoad={() => console.log(`${testMode ? 'Test' : 'Dashboard'} iframe loaded successfully`)}
        onError={(e) => console.error(`${testMode ? 'Test' : 'Dashboard'} iframe failed to load:`, e)}
      />
    </div>
  );
};

export default DashboardDebug;