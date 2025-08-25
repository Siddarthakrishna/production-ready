import React from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Mountain, MapPin, Heart, Camera, Compass, Route } from 'lucide-react';

const Passion = () => {
  const adventures = [
    {
      title: "Western Ghats Expedition",
      description: "Epic 500km journey through the misty mountains and lush valleys of Western Ghats, discovering hidden waterfalls and ancient trails.",
      location: "Maharashtra & Karnataka",
      duration: "7 Days",
      difficulty: "Expert",
      image: "https://images.unsplash.com/photo-1575548393466-0df1618ba410?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMGJpa2luZ3xlbnwwfHx8fDE3NTU4Nzg4NTh8MA&ixlib=rb-4.1.0&q=85"
    },
    {
      title: "Himalayan High Altitude Ride",
      description: "Challenging high-altitude adventure through rugged terrains, testing endurance and mental strength in the world's highest mountains.",
      location: "Ladakh & Spiti Valley",
      duration: "12 Days",
      difficulty: "Extreme",
      image: "https://images.unsplash.com/photo-1629056528325-f328b5f27ae7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHwzfHxtb3VudGFpbiUyMGJpa2luZ3xlbnwwfHx8fDE3NTU4Nzg4NTh8MA&ixlib=rb-4.1.0&q=85"
    },
    {
      title: "Coastal Trail Adventure",
      description: "Scenic coastal expedition combining beach trails with forest paths, perfect blend of ocean views and tropical wilderness.",
      location: "Goa & Konkan Coast",
      duration: "4 Days",
      difficulty: "Moderate",
      image: "https://images.unsplash.com/photo-1633707167682-9068729bc84c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHw0fHxtb3VudGFpbiUyMGJpa2luZ3xlbnwwfHx8fDE3NTU4Nzg4NTh8MA&ixlib=rb-4.1.0&q=85"
    }
  ];

  const passionValues = [
    {
      icon: <Mountain className="w-8 h-8" />,
      title: "Adventure",
      description: "Seeking thrills in unexplored terrains and pushing physical limits through challenging expeditions."
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Freedom",
      description: "Finding liberation on the open road, where every trail leads to new discoveries and experiences."
    },
    {
      icon: <Compass className="w-8 h-8" />,
      title: "Exploration",
      description: "Discovering hidden paths and untold stories that exist beyond the conventional routes."
    }
  ];

  return (
    <section className="py-20 bg-gray-900 text-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Beyond the Markets
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-blue-400 mx-auto mb-6"></div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              While research defines my profession, adventure defines my soul. 
              Discovering the world on two wheels, one trail at a time.
            </p>
          </div>

          {/* Main Passion Statement */}
          <Card className="p-12 mb-16 bg-gray-800/60 backdrop-blur-md border border-gray-700/50 hover:bg-gray-800/80 transition-all duration-300">
            <div className="text-center">
              <Route className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
              <h3 className="text-3xl font-bold mb-6">The Road Less Traveled</h3>
              <p className="text-lg text-gray-300 leading-relaxed max-w-4xl mx-auto">
                I am deeply passionate about off-road biking, endurance rides, and exploring trails 
                across the Western Ghats and beyond. Riding through rugged terrains teaches me the 
                same lessons that markets do—<span className="text-white font-semibold">patience, adaptability, 
                and courage in the face of uncertainty</span>. My biking journey is more than just travel; 
                it's about embracing challenges, discovering hidden paths, and living every moment with intensity.
              </p>
            </div>
          </Card>

          {/* Adventure Gallery */}
          <div className="mb-16">
            <h3 className="text-3xl font-bold text-center mb-12">Recent Adventures</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {adventures.map((adventure, index) => (
                <Card 
                  key={index}
                  className="bg-gray-800/60 backdrop-blur-md border border-gray-700/50 overflow-hidden hover:bg-gray-800/80 transition-all duration-300 group"
                >
                  <div className="relative">
                    <img 
                      src={adventure.image}
                      alt={adventure.title}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent"></div>
                    <Badge 
                      className={`absolute top-4 right-4 ${
                        adventure.difficulty === 'Extreme' ? 'bg-red-500/80' :
                        adventure.difficulty === 'Expert' ? 'bg-yellow-500/80' : 'bg-green-500/80'
                      } text-white`}
                    >
                      {adventure.difficulty}
                    </Badge>
                  </div>
                  
                  <div className="p-6">
                    <h4 className="text-xl font-bold mb-3 group-hover:text-yellow-400 transition-colors duration-300">
                      {adventure.title}
                    </h4>
                    
                    <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                      {adventure.description}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <MapPin className="w-4 h-4" />
                        <span>{adventure.location}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-400">
                        <span>Duration: {adventure.duration}</span>
                        <Camera className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Passion Values */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {passionValues.map((value, index) => (
              <Card 
                key={index}
                className="p-8 text-center bg-gray-800/60 backdrop-blur-md border border-gray-700/50 hover:bg-gray-800/80 transition-all duration-300 transform hover:scale-105"
              >
                <div className="text-yellow-400 mb-4">
                  {value.icon}
                </div>
                <h4 className="text-xl font-bold mb-3">{value.title}</h4>
                <p className="text-gray-300 leading-relaxed">
                  {value.description}
                </p>
              </Card>
            ))}
          </div>

          {/* Philosophy Quote */}
          <Card className="p-12 bg-gradient-to-r from-yellow-600/20 to-blue-600/20 backdrop-blur-md border border-yellow-400/30 text-center">
            <blockquote className="text-2xl md:text-3xl font-bold mb-6 italic">
              "Through Sharada Research, I bring both worlds together—
              <br />
              <span className="text-yellow-400">the discipline of financial markets</span>
              <br />
              and <span className="text-blue-400">the freedom of the open road.</span>"
            </blockquote>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button 
                size="lg"
                className="px-8 py-4 bg-yellow-500 hover:bg-yellow-600 text-black transform hover:scale-105 transition-all duration-300"
              >
                Follow My Adventures
              </Button>
              <Button 
                variant="outline"
                size="lg"
                className="px-8 py-4 border-2 border-gray-600/50 text-white hover:bg-gray-800/50 transform hover:scale-105 transition-all duration-300"
              >
                Join Next Expedition
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Passion;