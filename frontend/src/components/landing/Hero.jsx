import React, { useEffect } from 'react';
import { Link } from 'react-scroll';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { ChevronDown, Code, TrendingUp, MapPin, Star } from 'lucide-react';
import '../../styles/Hero.css';

const Hero = () => {
  useEffect(() => {
    // GSAP animations can be added here
    return () => {
      // Cleanup
    };
  }, []);

  return (
    <section id="home" className="hero-section min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Ladakh Night Sky Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`
        }}
      />
      
      {/* Animated Stars */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-yellow-400 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Mountain Silhouette */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-900/80 to-transparent"></div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-16 sm:py-20 flex flex-col justify-center min-h-screen">
        <div className="max-w-6xl mx-auto text-center">
          {/* Main Heading */}
          <div className="mb-8">
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-white via-blue-200 to-yellow-400 bg-clip-text text-transparent animate-fade-in">
              Hi! I'm <br />
              <span className="text-white drop-shadow-2xl">Siddharth Krishna</span>
            </h1>
            
            <div className="text-xl sm:text-2xl md:text-4xl font-light text-blue-200 mb-6 sm:mb-8 animate-slide-up">
              I make your{' '}
              <span className="font-bold text-transparent bg-gradient-to-r from-yellow-400 via-blue-400 to-white bg-clip-text">
                ideas digital
              </span>
            </div>
          </div>

          {/* Professional Tags */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-8 sm:mb-12">
            <Card className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-800/60 backdrop-blur-md border border-yellow-400/30 hover:border-yellow-400/60 hover:bg-gray-800/80 transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center gap-2 text-white">
                <Code className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                <span className="font-semibold text-sm sm:text-base">Full Stack Developer</span>
              </div>
            </Card>
            <Card className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-800/60 backdrop-blur-md border border-blue-400/30 hover:border-blue-400/60 hover:bg-gray-800/80 transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center gap-2 text-white">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                <span className="font-semibold text-sm sm:text-base">Research Analyst</span>
              </div>
            </Card>
            <Card className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-800/60 backdrop-blur-md border border-white/30 hover:border-white/60 hover:bg-gray-800/80 transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center gap-2 text-white">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                <span className="font-semibold text-sm sm:text-base">Trader</span>
              </div>
            </Card>
          </div>

          {/* Description */}
          <p className="text-lg sm:text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto mb-8 sm:mb-12 leading-relaxed font-light px-4">
            Welcome to{' '}
            <span className="font-semibold text-yellow-400">Sharada Research</span>, where knowledge meets precision. 
            A space dedicated to exploring financial markets, decoding trends, and uncovering opportunities 
            that shape the future of investments.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mb-12 sm:mb-16 px-4">
            <Link to="ideas" smooth={true} duration={500}>
              <Button 
                size="lg" 
                className="px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Star className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Explore Ideas
              </Button>
            </Link>
            <Link to="contact" smooth={true} duration={500}>
              <Button 
                variant="outline" 
                size="lg" 
                className="px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg border-2 border-blue-400/50 text-blue-400 hover:bg-blue-400/10 hover:border-blue-400 transform hover:scale-105 transition-all duration-300"
              >
                Contact Me
              </Button>
            </Link>
          </div>

          {/* Adventure Quote */}
          <div className="mb-8 sm:mb-12">
            <p className="text-sm sm:text-base text-yellow-400/80 italic max-w-2xl mx-auto px-4">
              "Like the vast night skies of Ladakh, every market holds infinite possibilities waiting to be discovered."
            </p>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <ChevronDown className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400/70" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;