import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const iframeRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Handle messages from the iframe
    const handleMessage = (event) => {
      // Handle navigation messages from the iframe
      if (event.data && event.data.type === 'navigate') {
        navigate(event.data.path);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [navigate]);

  return (
    <div style={{ width: '100%', height: '100vh', border: 'none' }}>
      <iframe
        ref={iframeRef}
        src="/financial/home.html"
        title="Financial Dashboard"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          overflow: 'hidden'
        }}
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
      />
    </div>
  );
};

export default Dashboard;
