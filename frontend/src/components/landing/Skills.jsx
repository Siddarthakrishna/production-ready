import React from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

const Skills = () => {
  const skillCategories = [
    {
      title: "Frontend Development",
      skills: ["HTML5", "CSS3", "JavaScript", "React", "Responsive Design", "UI/UX"],
      color: "from-yellow-500/20 to-yellow-600/20",
      border: "border-yellow-400/30"
    },
    {
      title: "Backend Development", 
      skills: ["Node.js", "Express.js", "REST APIs", "MongoDB", "Authentication", "Server Management"],
      color: "from-blue-500/20 to-blue-600/20",
      border: "border-blue-400/30"
    },
    {
      title: "Financial Analysis",
      skills: ["Stock Market", "Derivatives Trading", "F&O Analysis", "Risk Management", "Portfolio Analysis", "Market Research"],
      color: "from-white/10 to-slate-200/10",
      border: "border-white/30"
    },
    {
      title: "Data & Research",
      skills: ["Data Analysis", "Trading Models", "Dashboard Design", "Market Trends", "Technical Analysis", "Research Reports"],
      color: "from-gray-500/20 to-gray-600/20",
      border: "border-gray-400/30"
    }
  ];

  const technologies = [
    "HTML5", "CSS3", "JavaScript", "Node.js", "React", "MongoDB", "Trading Analytics", "Financial Modeling",
    "Python", "Data Visualization", "REST APIs", "Express.js", "Technical Analysis", "Risk Management"
  ];

  return (
    <section className="py-16 sm:py-20 bg-gray-900 relative overflow-hidden">
      {/* Financial Dashboard Background */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1639754390580-2e7437267698?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwxfHx0cmFkaW5nJTIwY2hhcnRzfGVufDB8fHx8MTc1NTg3ODg1M3ww&ixlib=rb-4.1.0&q=85')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />

      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
            Technical Expertise
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-blue-400 mx-auto mb-4 sm:mb-6"></div>
          <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto px-4">
            Combining full-stack development skills with financial market expertise 
            to build data-driven solutions and analytical frameworks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-6xl mx-auto mb-16 sm:mb-20">
          {skillCategories.map((category, index) => (
            <Card 
              key={index}
              className={`p-6 sm:p-8 bg-gray-800/60 backdrop-blur-sm hover:bg-gray-800/80 transition-all duration-300 transform hover:scale-105 hover:shadow-xl border ${category.border} shadow-lg`}
            >
              <div className={`h-1 w-full bg-gradient-to-r ${category.color.replace('/20', '')} rounded-full mb-4 sm:mb-6`}></div>
              
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">
                {category.title}
              </h3>
              
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {category.skills.map((skill, skillIndex) => (
                  <Badge 
                    key={skillIndex}
                    variant="secondary"
                    className="px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-medium bg-gray-700/60 text-gray-200 hover:bg-gray-700/80 transition-colors duration-200 border border-gray-600/30"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* Infinite Scrolling Tech Stack */}
        <div className="mb-12 sm:mb-16">
          <h3 className="text-2xl sm:text-3xl font-bold text-center text-white mb-8 sm:mb-12">
            Core Technologies
          </h3>
          
          {/* Infinite Scroll Container */}
          <div className="relative overflow-hidden">
            <div className="flex animate-scroll">
              {/* First set */}
              {technologies.map((tech, index) => (
                <div 
                  key={`first-${index}`}
                  className="flex-shrink-0 mx-3 sm:mx-4 px-4 sm:px-6 py-2 sm:py-3 bg-gray-800/60 backdrop-blur-sm border border-yellow-400/30 rounded-full whitespace-nowrap"
                >
                  <span className="text-white font-medium text-sm sm:text-base">{tech}</span>
                </div>
              ))}
              {/* Duplicate set for seamless loop */}
              {technologies.map((tech, index) => (
                <div 
                  key={`second-${index}`}
                  className="flex-shrink-0 mx-3 sm:mx-4 px-4 sm:px-6 py-2 sm:py-3 bg-gray-800/60 backdrop-blur-sm border border-yellow-400/30 rounded-full whitespace-nowrap"
                >
                  <span className="text-white font-medium text-sm sm:text-base">{tech}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Adventure-themed Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 max-w-4xl mx-auto">
          {[
            { number: "5+", label: "Years", desc: "Market Experience" },
            { number: "50+", label: "Projects", desc: "Completed" },
            { number: "100+", label: "Models", desc: "Built" },
            { number: "∞", label: "Adventures", desc: "Ahead" }
          ].map((stat, index) => (
            <Card 
              key={index}
              className="p-4 sm:p-6 text-center bg-gray-800/50 backdrop-blur-sm border border-yellow-400/20 hover:border-yellow-400/40 hover:bg-gray-800/70 transition-all duration-300 group"
            >
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-yellow-400 mb-1 sm:mb-2 group-hover:text-white transition-colors duration-300">
                {stat.number}
              </div>
              <div className="text-sm sm:text-base font-semibold text-white mb-1">
                {stat.label}
              </div>
              <div className="text-xs sm:text-sm text-gray-300">
                {stat.desc}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;