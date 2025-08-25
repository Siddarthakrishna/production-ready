import React from 'react';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <h3 className="text-3xl font-bold mb-2">
                  Sharada Research
                </h3>
                <p className="text-blue-200 text-lg">
                  Where Knowledge Meets Precision
                </p>
              </div>
              
              <p className="text-blue-100 leading-relaxed mb-6 max-w-md">
                Combining full-stack development expertise with deep financial market knowledge 
                to create innovative solutions for traders, investors, and businesses.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xl font-bold mb-6">Navigation</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#home" className="text-blue-200 hover:text-white transition-colors duration-300 flex items-center group">
                    <span className="w-0 group-hover:w-2 h-px bg-cyan-400 transition-all duration-300 mr-0 group-hover:mr-2"></span>
                    Home
                  </a>
                </li>
                <li>
                  <a href="#about" className="text-blue-200 hover:text-white transition-colors duration-300 flex items-center group">
                    <span className="w-0 group-hover:w-2 h-px bg-cyan-400 transition-all duration-300 mr-0 group-hover:mr-2"></span>
                    About
                  </a>
                </li>
                <li>
                  <a href="#skills" className="text-blue-200 hover:text-white transition-colors duration-300 flex items-center group">
                    <span className="w-0 group-hover:w-2 h-px bg-cyan-400 transition-all duration-300 mr-0 group-hover:mr-2"></span>
                    Skills
                  </a>
                </li>
                <li>
                  <a href="/dashboard" className="text-blue-200 hover:text-white transition-colors duration-300 flex items-center group">
                    <span className="w-0 group-hover:w-2 h-px bg-cyan-400 transition-all duration-300 mr-0 group-hover:mr-2"></span>
                    Dashboard
                  </a>
                </li>
                <li>
                  <a href="#contact" className="text-blue-200 hover:text-white transition-colors duration-300 flex items-center group">
                    <span className="w-0 group-hover:w-2 h-px bg-cyan-400 transition-all duration-300 mr-0 group-hover:mr-2"></span>
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-xl font-bold mb-6">Services</h4>
              <ul className="space-y-3">
                <li>
                  <a href="/fii_dii_data.html" className="text-blue-200 hover:text-white transition-colors duration-300 flex items-center group">
                    <span className="w-0 group-hover:w-2 h-px bg-cyan-400 transition-all duration-300 mr-0 group-hover:mr-2"></span>
                    FII/DII Analysis
                  </a>
                </li>
                <li>
                  <a href="/fno.html" className="text-blue-200 hover:text-white transition-colors duration-300 flex items-center group">
                    <span className="w-0 group-hover:w-2 h-px bg-cyan-400 transition-all duration-300 mr-0 group-hover:mr-2"></span>
                    F&O Analysis
                  </a>
                </li>
                <li>
                  <a href="/sectorial_flow.html" className="text-blue-200 hover:text-white transition-colors duration-300 flex items-center group">
                    <span className="w-0 group-hover:w-2 h-px bg-cyan-400 transition-all duration-300 mr-0 group-hover:mr-2"></span>
                    Sector Analysis
                  </a>
                </li>
                <li>
                  <a href="/market_depth.html" className="text-blue-200 hover:text-white transition-colors duration-300 flex items-center group">
                    <span className="w-0 group-hover:w-2 h-px bg-cyan-400 transition-all duration-300 mr-0 group-hover:mr-2"></span>
                    Market Depth
                  </a>
                </li>
                <li>
                  <a href="/moneyflux.html" className="text-blue-200 hover:text-white transition-colors duration-300 flex items-center group">
                    <span className="w-0 group-hover:w-2 h-px bg-cyan-400 transition-all duration-300 mr-0 group-hover:mr-2"></span>
                    Money Flux
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-white/20 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-blue-200 text-center md:text-left">
              <p>
                © 2025 Sharada Research. All Rights Reserved
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-blue-200 text-sm">Back to top</span>
              <button 
                onClick={scrollToTop}
                className="w-10 h-10 bg-cyan-600 hover:bg-cyan-700 rounded-full flex items-center justify-center transform hover:scale-110 transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;