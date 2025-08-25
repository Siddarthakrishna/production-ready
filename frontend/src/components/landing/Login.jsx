import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Shield, 
  Fingerprint,
  Smartphone,
  Star,
  Mountain
} from 'lucide-react';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loginType, setLoginType] = useState('admin'); // admin, trader, analyst

  const loginTypes = [
    { 
      id: 'admin', 
      label: 'Admin Portal', 
      icon: <Shield className="w-4 h-4" />,
      color: 'from-yellow-500 to-yellow-600',
      description: 'Full system access'
    },
    { 
      id: 'trader', 
      label: 'Trading Desk', 
      icon: <Star className="w-4 h-4" />,
      color: 'from-blue-500 to-blue-600',
      description: 'Market analysis tools'
    },
    { 
      id: 'analyst', 
      label: 'Research Portal', 
      icon: <Mountain className="w-4 h-4" />,
      color: 'from-white to-slate-200',
      description: 'Data & insights'
    }
  ];

  return (
    <section className="min-h-screen py-16 sm:py-20 bg-gradient-to-br from-black via-slate-900 to-blue-900 relative overflow-hidden">
      {/* Pangong Lake Night Sky Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1516426122078-c23e76319801?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2068&q=80')`
        }}
      />

      {/* Animated Stars */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
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

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-yellow-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Fingerprint className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-4">
              Secure Access Portal
            </h2>
            <p className="text-blue-200 text-sm sm:text-base">
              Enter the digital realm of Sharada Research
            </p>
          </div>

          {/* Login Type Selection */}
          <div className="mb-6 sm:mb-8">
            <div className="grid grid-cols-1 gap-3">
              {loginTypes.map((type) => (
                <Card 
                  key={type.id}
                  className={`p-3 sm:p-4 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                    loginType === type.id 
                      ? 'bg-black/60 border-yellow-400/60 shadow-lg' 
                      : 'bg-black/30 border-white/20 hover:bg-black/40'
                  } backdrop-blur-sm border`}
                  onClick={() => setLoginType(type.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 bg-gradient-to-r ${type.color} rounded-lg flex items-center justify-center text-black`}>
                      {type.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white text-sm sm:text-base">{type.label}</h3>
                      <p className="text-xs sm:text-sm text-blue-200">{type.description}</p>
                    </div>
                    {loginType === type.id && (
                      <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-400/30 text-xs">
                        Selected
                      </Badge>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Login Form */}
          <Card className="p-6 sm:p-8 bg-black/40 backdrop-blur-md border border-yellow-400/30 shadow-2xl">
            <form className="space-y-4 sm:space-y-6">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                  <Input 
                    type="email"
                    placeholder="admin@sharadaresearch.com"
                    className="pl-10 sm:pl-12 bg-black/20 border-white/20 text-white placeholder:text-white/60 focus:border-yellow-400 transition-colors duration-300 text-sm sm:text-base py-2 sm:py-3"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                  <Input 
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your secure password"
                    className="pl-10 sm:pl-12 pr-10 sm:pr-12 bg-black/20 border-white/20 text-white placeholder:text-white/60 focus:border-yellow-400 transition-colors duration-300 text-sm sm:text-base py-2 sm:py-3"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors duration-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center text-white">
                  <input type="checkbox" className="mr-2 accent-yellow-400" />
                  Remember me
                </label>
                <a href="#" className="text-blue-400 hover:text-yellow-400 transition-colors duration-300">
                  Forgot password?
                </a>
              </div>

              {/* Login Button */}
              <Button 
                size="lg"
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold transform hover:scale-105 transition-all duration-300 shadow-lg text-sm sm:text-base py-2 sm:py-3"
              >
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Access {loginTypes.find(t => t.id === loginType)?.label}
              </Button>

              {/* Biometric Login */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-black/40 text-white/60">or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <Button 
                  variant="outline"
                  className="border-blue-400/30 text-blue-400 hover:bg-blue-400/10 hover:border-blue-400 transition-all duration-300 text-xs sm:text-sm py-2"
                >
                  <Fingerprint className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Biometric
                </Button>
                <Button 
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 hover:border-white transition-all duration-300 text-xs sm:text-sm py-2"
                >
                  <Smartphone className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  2FA Code
                </Button>
              </div>
            </form>
          </Card>

          {/* Security Notice */}
          <div className="mt-6 sm:mt-8 text-center">
            <p className="text-xs sm:text-sm text-blue-200/80">
              🔒 Secured by military-grade encryption • Protected by advanced AI monitoring
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;