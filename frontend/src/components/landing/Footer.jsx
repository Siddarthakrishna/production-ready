import React from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Mail, 
  Linkedin, 
  Github, 
  Twitter, 
  Heart,
  Code,
  TrendingUp,
  Mountain,
  ArrowUp
} from 'lucide-react';

const Footer = () => {
  const quickLinks = [
    { label: "About", href: "#about" },
    { label: "Skills", href: "#skills" },
    { label: "Professional", href: "#professional" },
    { label: "Passion", href: "#passion" },
    { label: "Testimonials", href: "#testimonials" },
    { label: "Contact", href: "#contact" }
  ];

  const services = [
    { label: "Market Analysis", href: "#" },
    { label: "Trading Strategies", href: "#" },
    { label: "Dashboard Development", href: "#" },
    { label: "Research Reports", href: "#" },
    { label: "Full Stack Development", href: "#" },
    { label: "Consultation", href: "#" }
  ];

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

              {/* Specialties */}
              <div className="flex flex-wrap gap-2 mb-6">
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30">
                  <Code className="w-3 h-3 mr-1" />
                  Full Stack Dev
                </Badge>
                <Badge className="bg-green-500/20 text-green-300 border-green-400/30">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Market Analysis
                </Badge>
                <Badge className="bg-orange-500/20 text-orange-300 border-orange-400/30">
                  <Mountain className="w-3 h-3 mr-1" />
                  Adventure Spirit
                </Badge>
              </div>

              {/* Social Links */}
              <div className="flex gap-4">
                {[
                  { icon: <Linkedin className="w-5 h-5" />, href: "#", color: "hover:text-blue-400" },
                  { icon: <Github className="w-5 h-5" />, href: "#", color: "hover:text-slate-300" },
                  { icon: <Twitter className="w-5 h-5" />, href: "#", color: "hover:text-sky-400" },
                  { icon: <Mail className="w-5 h-5" />, href: "mailto:hello@sharadaresearch.com", color: "hover:text-red-400" }
                ].map((social, index) => (
                  <a 
                    key={index}
                    href={social.href}
                    className={`w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-blue-200 ${social.color} transition-all duration-300 transform hover:scale-110 hover:bg-white/20`}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xl font-bold mb-6">Quick Links</h4>
              <ul className="space-y-3">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <a 
                      href={link.href}
                      className="text-blue-200 hover:text-white transition-colors duration-300 flex items-center group"
                    >
                      <span className="w-0 group-hover:w-2 h-px bg-cyan-400 transition-all duration-300 mr-0 group-hover:mr-2"></span>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-xl font-bold mb-6">Services</h4>
              <ul className="space-y-3">
                {services.map((service, index) => (
                  <li key={index}>
                    <a 
                      href={service.href}
                      className="text-blue-200 hover:text-white transition-colors duration-300 flex items-center group"
                    >
                      <span className="w-0 group-hover:w-2 h-px bg-cyan-400 transition-all duration-300 mr-0 group-hover:mr-2"></span>
                      {service.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <Card className="p-8 mb-12 bg-white/10 backdrop-blur-md border-white/20">
          <div className="text-center md:text-left md:flex md:items-center md:justify-between">
            <div className="mb-6 md:mb-0">
              <h4 className="text-2xl font-bold mb-2">Stay Updated</h4>
              <p className="text-blue-100">
                Get the latest market insights, trading strategies, and development updates.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 md:max-w-md">
              <input 
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:outline-none focus:border-cyan-400 transition-colors duration-300"
              />
              <button className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-lg font-semibold transform hover:scale-105 transition-all duration-300">
                Subscribe
              </button>
            </div>
          </div>
        </Card>

        {/* Bottom Footer */}
        <div className="border-t border-white/20 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-blue-200 text-center md:text-left">
              <p>
                © 2024 Sharada Research. Made with{' '}
                <Heart className="w-4 h-4 inline text-red-400" /> by Siddharth Krishna
              </p>
              <p className="text-sm mt-1">
                All rights reserved. Combining passion for markets with love for code.
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-blue-200 text-sm">Back to top</span>
              <button 
                onClick={scrollToTop}
                className="w-10 h-10 bg-cyan-600 hover:bg-cyan-700 rounded-full flex items-center justify-center transform hover:scale-110 transition-all duration-300"
              >
                <ArrowUp className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;