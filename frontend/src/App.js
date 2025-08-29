import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';

// Landing page components
import Header from "./components/shared/Header";
import Hero from "./components/landing/Hero";
import About from "./components/landing/About";
import Skills from "./components/landing/Skills";
import Professional from "./components/landing/Professional";
import Passion from "./components/landing/Passion";
import Research from "./components/landing/Research";
import Testimonials from "./components/landing/Testimonials";
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
        <section id="testimonials">
          <Testimonials />
        </section>
        <section id="contact">
          <Contact />
        </section>
      </main>
      <Footer />
    </div>
  );
};

import Dashboard from "./components/financial/Dashboard";

function App() {
  return (
    <div className="App bg-gray-900">
      <BrowserRouter basename="/">
        <Routes>
          {/* Landing Page Route */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/landing" element={<LandingPage />} />
          
          {/* Financial Dashboard Routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/home" element={<Dashboard />} />
          <Route path="/fii_dii_data" element={<Dashboard />} />
          <Route path="/fno" element={<Dashboard />} />
          <Route path="/sectorial_flow" element={<Dashboard />} />
          <Route path="/market_depth" element={<Dashboard />} />
          <Route path="/moneyflux" element={<Dashboard />} />
          <Route path="/pro_setup" element={<Dashboard />} />
          <Route path="/swing_center" element={<Dashboard />} />
          <Route path="/index_analysis" element={<Dashboard />} />
          <Route path="/scanners" element={<Dashboard />} />
          <Route path="/trading_journal" element={<Dashboard />} />
          <Route path="/watchlist" element={<Dashboard />} />
          <Route path="/ollama_assistant" element={<Dashboard />} />
          
          {/* Catch-all route for direct HTML access */}
          <Route path="/financial/:page" element={<Dashboard />} />
          
          {/* 404 Route */}
          <Route path="*" element={
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">404</h1>
                <p className="text-xl mb-6">Page not found</p>
                <a href="/" className="text-blue-400 hover:underline">
                  Go to Home
                </a>
              </div>
            </div>
          } />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;