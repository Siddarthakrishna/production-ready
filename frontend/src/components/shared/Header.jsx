import React, { useState, useEffect } from 'react';
import { Link } from 'react-scroll';
import { Button } from '../landing/ui/button';
import { Menu, X, Code, TrendingUp, Mail, ExternalLink } from 'lucide-react';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const navItems = [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { label: 'Skills', href: '#skills' },
    { label: 'Professional', href: '#professional' },
    { label: 'Research', href: '#research' },
    { label: 'Passion', href: '#passion' },
    { label: 'Testimonials', href: '#testimonials' },
    { label: 'Contact', href: '#contact' }
  ];

  const scrollToSection = (href) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 glass ${scrolled ? 'scrolled' : ''}`}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo/Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
              <Code className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`font-bold text-xl transition-colors duration-300 ${scrolled ? 'text-slate-800' : 'text-white'}`}>
                Sharada Research
              </h1>
              <p className={`text-xs transition-colors duration-300 ${scrolled ? 'text-slate-600' : 'text-blue-200'}`}>
                Full Stack • Research • Trading
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item, index) => (
              <Link 
                key={index} 
                to={item.href} 
                smooth={true} 
                duration={500} 
                className={`font-medium transition-all duration-300 hover:scale-105 ${scrolled ? 'text-slate-700 hover:text-blue-600' : 'text-blue-100 hover:text-white'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA Buttons */}
          <div className="hidden lg:flex items-center gap-4">
            <a 
              href="/dashboard" 
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 transform hover:scale-105 ${scrolled ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
              View Dashboard
            </a>
            
            <Button 
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transform hover:scale-105 transition-all duration-300"
              onClick={() => scrollToSection('#contact')}
            >
              <Mail className="w-4 h-4 mr-2" />
              Contact
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className={`lg:hidden p-2 rounded-lg transition-colors duration-300 ${scrolled ? 'text-slate-700 hover:bg-slate-100' : 'text-white hover:bg-white/10'}`}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-lg animate-in slide-in-from-top-4 duration-300">
            <nav className="py-6 px-6">
              <div className="space-y-4">
                {navItems.map((item, index) => (
                  <Link 
                    key={index} 
                    to={item.href} 
                    smooth={true} 
                    duration={500} 
                    className="block w-full text-left py-3 px-4 text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              
              {/* Mobile CTA Buttons */}
              <div className="mt-6 pt-6 border-t border-slate-200 space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Dashboard
                </Button>
                
                <Button 
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                  onClick={() => scrollToSection('#contact')}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Get In Touch
                </Button>
              </div>

              {/* Mobile Social Links */}
              <div className="mt-6 pt-6 border-t border-slate-200">
                <p className="text-sm text-slate-600 mb-4">Connect with me:</p>
                <div className="flex gap-4">
                  {[
                    { icon: '💼', label: 'LinkedIn', href: '#' },
                    { icon: '💻', label: 'GitHub', href: '#' },
                    { icon: '🐦', label: 'Twitter', href: '#' }
                  ].map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 transition-colors duration-300"
                    >
                      <span>{social.icon}</span>
                      <span>{social.label}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ))}
                </div>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;