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

// Financial application components
import Login from "./components/landing/Login";

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

const LoginPage = () => {
  return (
    <div className="min-h-screen bg-gray-900">
      <Login />
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

function App() {
  return (
    <div className="App bg-gray-900">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<FinancialPage pageName="Dashboard" />} />
          <Route path="/fii_dii_data" element={<FinancialPage pageName="FII/DII Data" />} />
          <Route path="/fno" element={<FinancialPage pageName="F&O Analysis" />} />
          <Route path="/sectorial_flow" element={<FinancialPage pageName="Sectorial Flow" />} />
          <Route path="/market_depth" element={<FinancialPage pageName="Market Depth" />} />
          <Route path="/moneyflux" element={<FinancialPage pageName="Money Flux" />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;