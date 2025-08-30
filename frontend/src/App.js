// In App.js
import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';

// ... other imports ...

// Landing page components
import Header from "./components/shared/Header";
import Hero from "./components/landing/Hero";
import About from "./components/landing/About";
import Skills from "./components/landing/Skills";
import Professional from "./components/landing/Professional";
import Passion from "./components/landing/Passion";
import Research from "./components/landing/Research";
import Contact from "./components/landing/Contact";
import Footer from "./components/shared/Footer";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      <main>
        <section id="home">
          <Hero />
        </section>
        <section id="about">
          <About />
        </section>
        <section id="skills">
          <Skills />
        </section>
        <section id="professional">
          <Professional />
        </section>
        <section id="research">
          <Research />
        </section>
        <section id="passion">
          <Passion />
        </section>
        <section id="contact">
          <Contact />
        </section>
      </main>
      <Footer />
    </div>
  );
};

function Dashboard() {
  const navigate = useNavigate();

  const navigateToStaticPage = (page) => {
    // Navigate to financial pages with proper routing
    window.location.href = `/financial/${page}.html`;
  };

  const navigateToReactDashboard = () => {
    // Navigate back to React dashboard
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <nav className="bg-gray-800 p-4 mb-6 rounded-lg">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Financial Dashboard</h1>
          <div className="space-x-2">
            <button 
              onClick={() => navigate('/')} 
              className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
            >
              Back to Home
            </button>
          </div>
        </div>
      </nav>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {['home', 'fii_dii_data', 'fno', 'sectorial_flow', 'market_depth', 
          'moneyflux', 'pro_setup', 'swing_center', 'index_analysis', 
          'scanners', 'trading_journal', 'watchlist', 'ollama_assistant'
        ].map((page) => (
          <div 
            key={page} 
            onClick={() => navigateToStaticPage(page)}
            className="p-6 bg-gray-800 rounded-lg shadow-lg cursor-pointer hover:bg-gray-700 transition-colors"
          >
            <h3 className="text-lg font-semibold capitalize">
              {page.replace(/_/g, ' ')}
            </h3>
          </div>
        ))}
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="App bg-gray-900">
      <BrowserRouter basename="/">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Catch-all route for direct HTML access */}
          <Route path="/financial/:page" element={
            <div className="min-h-screen bg-gray-900 text-white p-4">
              <button 
                onClick={() => window.location.href = '/dashboard'} 
                className="mb-4 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
              >
                ← Back to Dashboard
              </button>
              <div className="iframe-container">
                <iframe 
                  src={`/financial/${window.location.pathname.split('/').pop()}.html`}
                  className="w-full h-full border-0 bg-white rounded-lg"
                  title="Financial Page"
                  onError={(e) => {
                    console.error('Failed to load iframe:', e);
                    e.target.contentWindow.document.body.innerHTML = `
                      <div style="padding: 20px; text-align: center;">
                        <h2>Failed to load page</h2>
                        <p>Could not load ${window.location.pathname.split('/').pop()}.html</p>
                        <a href="/dashboard" style="color: blue; text-decoration: underline;">Return to Dashboard</a>
                      </div>
                    `;
                  }}
                />
              </div>
            </div>
          } />
          
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl mb-6">Page not found</p>
        <a href="/" className="text-blue-400 hover:underline">
          Go to Home
        </a>
      </div>
    </div>
  );
}

export default App;