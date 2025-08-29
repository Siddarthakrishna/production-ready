import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

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

// For the financial application pages, we'll render them directly from the HTML files
const FinancialPage = ({ pageName }) => {
  // This is a placeholder - in a real implementation, we would either:
  // 1. Convert the HTML files to React components
  // 2. Use dangerouslySetInnerHTML to render the HTML content
  // 3. Create separate React components for each financial page
  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      <div className="container mx-auto px-6 py-20">
        <h1 className="text-3xl font-bold text-white mb-6">{pageName}</h1>
        <p className="text-blue-200">
          This is where the {pageName} financial application page would be displayed.
        </p>
        <p className="text-blue-200 mt-4">
          In a complete implementation, this would show the financial dashboard and tools.
        </p>
      </div>
      <Footer />
    </div>
  );
};

// Import the Dashboard components
import Dashboard from "./components/financial/Dashboard";
import MainDashboard from "./components/Dashboard";
import HomeDashboard from "./components/financial/HomeDashboard";
import DashboardDebug from "./components/financial/DashboardDebug";

function App() {
  return (
    <div className="App bg-gray-900">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/dashboard" element={<HomeDashboard />} />
          <Route path="/home" element={<HomeDashboard />} />
          <Route path="/fii_dii_data" element={<FinancialPage pageName="FII/DII Data" />} />
          <Route path="/fno" element={<FinancialPage pageName="F&O Analysis" />} />
          <Route path="/sectorial_flow" element={<FinancialPage pageName="Sectorial Flow" />} />
          <Route path="/market_depth" element={<FinancialPage pageName="Market Depth" />} />
          <Route path="/moneyflux" element={<FinancialPage pageName="Money Flux" />} />
          <Route path="/pro_setup" element={<FinancialPage pageName="Pro Setups" />} />
          <Route path="/swing_center" element={<FinancialPage pageName="Swing Center" />} />
          <Route path="/index_analysis" element={<FinancialPage pageName="Index Analysis" />} />
          <Route path="/scanners" element={<FinancialPage pageName="Scanners" />} />
          <Route path="/trading_journal" element={<FinancialPage pageName="Trading Journal" />} />
          <Route path="/watchlist" element={<FinancialPage pageName="Watchlist" />} />
          <Route path="/ollama_assistant" element={<FinancialPage pageName="Ollama Assistant" />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;