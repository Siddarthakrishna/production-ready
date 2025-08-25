import React from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Star, Quote } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      name: "Rajesh Kumar",
      role: "Senior Portfolio Manager",
      company: "Axis Mutual Fund",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      text: "Siddharth's market analysis is exceptionally thorough and accurate. His research reports have consistently helped our investment decisions.",
      rating: 5,
      specialization: "Investment Strategy"
    },
    {
      name: "Priya Sharma",
      role: "Lead Developer",
      company: "TechNova Solutions",
      image: "https://images.unsplash.com/photo-1494790108755-2616b172e10d?w=150&h=150&fit=crop&crop=face",
      text: "Working with Siddharth on our trading dashboard was incredible. His full-stack expertise combined with deep financial knowledge resulted in a platform that exceeded expectations.",
      rating: 5,
      specialization: "Full Stack Development"
    },
    {
      name: "Amit Patel",
      role: "Trading Head",
      company: "Kotak Securities",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      text: "Siddharth's F&O analysis and risk management strategies have been instrumental in optimizing our trading operations. His market intuition is truly exceptional.",
      rating: 5,
      specialization: "F&O Trading"
    },
    {
      name: "Dr. Meera Reddy",
      role: "Chief Research Officer",
      company: "Financial Insights Ltd",
      image: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face",
      text: "Siddharth combines analytical rigor with practical market experience. His research methodology is solid, and his ability to identify emerging trends consistently impresses our team.",
      rating: 5,
      specialization: "Market Research"
    },
    {
      name: "Vikram Singh",
      role: "Investment Advisor",
      company: "WealthMax Advisory",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face",
      text: "The trading models developed by Siddharth have significantly improved our portfolio performance. His attention to detail and innovative approach is outstanding.",
      rating: 5,
      specialization: "Portfolio Management"
    },
    {
      name: "Anita Gupta",
      role: "Senior Software Engineer",
      company: "FinTech Innovations",
      image: "https://images.unsplash.com/photo-1494790108755-2616b172e10d?w=150&h=150&fit=crop&crop=face",
      text: "Siddharth delivered a complex analytics dashboard ahead of schedule. His code quality is excellent, and his understanding of both technology and finance made collaboration seamless.",
      rating: 5,
      specialization: "Analytics Development"
    }
  ];

  return (
    <section className="py-20 bg-gray-800">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Professional Endorsements
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-blue-400 mx-auto mb-6"></div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              What industry professionals say about working with Sharada Research
            </p>
          </div>

          {/* Professional Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {testimonials.map((testimonial, index) => (
              <Card 
                key={index}
                className="p-6 bg-gray-900/60 hover:bg-gray-900/80 transition-all duration-300 transform hover:scale-105 hover:shadow-xl border border-gray-700/50 shadow-lg group"
              >
                {/* Header with Avatar and Info */}
                <div className="flex items-center mb-4">
                  <img 
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div className="flex-1">
                    <h4 className="font-bold text-white group-hover:text-yellow-400 transition-colors duration-300">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-gray-400">{testimonial.role}</p>
                    <p className="text-xs text-gray-500">{testimonial.company}</p>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>

                {/* Testimonial Text */}
                <div className="relative mb-4">
                  <Quote className="w-6 h-6 text-yellow-400/30 absolute -top-2 -left-2" />
                  <p className="text-gray-300 leading-relaxed pl-4">
                    {testimonial.text}
                  </p>
                </div>

                {/* Specialization Badge */}
                <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border border-yellow-400/30">
                  {testimonial.specialization}
                </Badge>
              </Card>
            ))}
          </div>

          {/* Stats Section */}
          <div className="text-center">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="group">
                <div className="text-4xl font-bold text-yellow-400 mb-2 group-hover:text-white transition-colors duration-300">
                  98%
                </div>
                <div className="text-gray-300">Client Satisfaction</div>
              </div>
              <div className="group">
                <div className="text-4xl font-bold text-blue-400 mb-2 group-hover:text-white transition-colors duration-300">
                  50+
                </div>
                <div className="text-gray-300">Successful Projects</div>
              </div>
              <div className="group">
                <div className="text-4xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors duration-300">
                  25+
                </div>
                <div className="text-gray-300">Industry Partners</div>
              </div>
              <div className="group">
                <div className="text-4xl font-bold text-gray-400 mb-2 group-hover:text-blue-400 transition-colors duration-300">
                  5.0
                </div>
                <div className="text-gray-300">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;