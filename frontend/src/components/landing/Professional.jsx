import React from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { BarChart, TrendingUp, PieChart, Target, Database, LineChart } from 'lucide-react';

const Professional = () => {
  const services = [
    {
      icon: <BarChart className="w-8 h-8" />,
      title: "Market Analysis",
      description: "In-depth analysis of stock markets, identifying trends, patterns, and investment opportunities through comprehensive research.",
      skills: ["Technical Analysis", "Fundamental Analysis", "Market Research"]
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Trading Strategies",
      description: "Development of data-driven trading strategies and F&O analysis with focus on risk management and consistent returns.",
      skills: ["F&O Trading", "Risk Management", "Strategy Development"]
    },
    {
      icon: <Database className="w-8 h-8" />,
      title: "Dashboard Development",
      description: "Building analytical dashboards and trading models that simplify complex market information into actionable insights.",
      skills: ["Data Visualization", "Trading Models", "Analytics Frameworks"]
    }
  ];

  const achievements = [
    { number: "5+", label: "Years Experience", desc: "in Financial Markets" },
    { number: "50+", label: "Trading Models", desc: "Built & Optimized" },
    { number: "100+", label: "Market Reports", desc: "Research & Analysis" },
    { number: "₹10M+", label: "Portfolio Value", desc: "Successfully Managed" }
  ];

  return (
    <section className="py-20 bg-gray-800">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Professional Expertise
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-blue-400 mx-auto mb-6"></div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              My professional journey revolves around financial research, stock market analysis, 
              and derivatives trading with a focus on the Indian financial ecosystem.
            </p>
          </div>

          {/* Hero Image with Overlay Content */}
          <div className="relative mb-20 rounded-2xl overflow-hidden shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1639754390580-2e7437267698?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwxfHx0cmFkaW5nJTIwY2hhcnRzfGVufDB8fHx8MTc1NTg3ODg1M3ww&ixlib=rb-4.1.0&q=85"
              alt="Financial Trading Charts"
              className="w-full h-96 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 to-gray-800/60"></div>
            
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white p-8">
                <PieChart className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
                <h3 className="text-3xl font-bold mb-4">Data-Driven Decision Making</h3>
                <p className="text-xl max-w-2xl">
                  Transforming complex market data into clear, actionable insights 
                  for informed investment decisions.
                </p>
              </div>
            </div>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {services.map((service, index) => (
              <Card 
                key={index}
                className="p-8 bg-gray-900/60 hover:bg-gray-900/80 transition-all duration-300 transform hover:scale-105 hover:shadow-xl border border-gray-700/50 shadow-lg group"
              >
                <div className="text-yellow-600 mb-6 group-hover:text-yellow-400 transition-colors duration-300">
                  {service.icon}
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-4">
                  {service.title}
                </h3>
                
                <p className="text-gray-300 mb-6 leading-relaxed">
                  {service.description}
                </p>
                
                <div className="space-y-2">
                  {service.skills.map((skill, skillIndex) => (
                    <Badge 
                      key={skillIndex}
                      variant="outline" 
                      className="mr-2 border-gray-600/50 text-gray-300 hover:bg-gray-700/50"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </Card>
            ))}
          </div>

          {/* Achievements Section */}
          <div className="bg-gray-900/60 rounded-2xl p-12 shadow-xl mb-12">
            <h3 className="text-3xl font-bold text-center text-white mb-12">
              Professional Milestones
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {achievements.map((achievement, index) => (
                <div key={index} className="text-center group">
                  <div className="text-4xl md:text-5xl font-bold text-yellow-400 mb-2 group-hover:text-white transition-colors duration-300">
                    {achievement.number}
                  </div>
                  <div className="text-lg font-semibold text-white mb-1">
                    {achievement.label}
                  </div>
                  <div className="text-sm text-gray-400">
                    {achievement.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Specializations */}
          <Card className="p-12 bg-gradient-to-r from-yellow-600/20 to-blue-600/20 border border-yellow-400/30 text-white">
            <div className="text-center">
              <LineChart className="w-16 h-16 mx-auto mb-6 text-yellow-400" />
              <h3 className="text-3xl font-bold mb-6">
                Specialized in Indian Financial Markets
              </h3>
              <p className="text-xl mb-8 max-w-3xl mx-auto text-gray-200">
                With a focus on the Indian financial ecosystem, my work combines research-driven 
                analysis with a practical approach that traders, investors, and businesses can rely on.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                {[
                  "NSE/BSE Analysis", 
                  "F&O Strategies", 
                  "Sector Research", 
                  "Risk Assessment",
                  "Portfolio Optimization",
                  "Market Timing"
                ].map((specialization, index) => (
                  <Badge 
                    key={index}
                    className="px-4 py-2 bg-gray-800/40 text-white border border-gray-600/30 hover:bg-gray-800/60"
                  >
                    {specialization}
                  </Badge>
                ))}
              </div>
              
              <Button 
                variant="secondary" 
                size="lg"
                className="px-8 py-4 bg-yellow-500 text-black hover:bg-yellow-400 transform hover:scale-105 transition-all duration-300"
              >
                View Research Reports
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Professional;