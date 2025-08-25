import React from 'react';
import { Link } from 'react-router-dom';

const Research = () => {
  return (
    <section id="research" className="py-20 bg-gray-900 text-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">Research Projects</h2>
        
        <div className="max-w-4xl mx-auto bg-gray-800 rounded-lg shadow-2xl p-8">
          <h3 className="text-2xl font-semibold mb-4">Sharada Research Project</h3>
          <p className="text-gray-300 mb-6">
            Explore my latest research project focused on [brief description of your research].
            This project showcases my work in [specific field/technology].
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <a 
              href="http://your-sharadaresearch-domain.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-center transition duration-300"
            >
              View Live Project
            </a>
            <a 
              href="https://github.com/yourusername/sharadaresearch-1" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg text-center transition duration-300"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Research;
