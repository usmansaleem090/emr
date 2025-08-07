import React from "react";
import { Shield, Activity, Users, Database, Heart, Stethoscope } from "lucide-react";

export const LoginBranding = () => {
  return (
    <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-teal-500 to-blue-700 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-16 w-24 h-24 border-2 border-white rounded-full animate-pulse"></div>
        <div className="absolute top-32 right-20 w-16 h-16 border border-white rounded-full animate-ping animation-delay-1000"></div>
        <div className="absolute bottom-32 left-1/4 w-32 h-32 border border-white rounded-full animate-bounce animation-delay-2000"></div>
        <div className="absolute bottom-20 right-16 w-20 h-20 border-2 border-white rounded-full animate-pulse animation-delay-3000"></div>
        
        {/* Floating medical icons */}
        <div className="absolute top-1/4 left-1/3 text-white/30 animate-float">
          <Heart className="w-8 h-8" />
        </div>
        <div className="absolute top-1/2 right-1/4 text-white/30 animate-float animation-delay-1000">
          <Stethoscope className="w-10 h-10" />
        </div>
        <div className="absolute bottom-1/3 left-1/5 text-white/30 animate-float animation-delay-2000">
          <Activity className="w-6 h-6" />
        </div>
      </div>
      
      {/* Medical Illustration SVG */}
      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 opacity-10">
        <svg width="300" height="400" viewBox="0 0 300 400" className="text-white">
          <g fill="currentColor">
            {/* Simplified medical cross */}
            <rect x="135" y="80" width="30" height="120" rx="4" />
            <rect x="90" y="125" width="120" height="30" rx="4" />
            {/* Medical bag outline */}
            <path d="M80 220 L220 220 L210 320 L90 320 Z" stroke="currentColor" strokeWidth="3" fill="none" />
            <rect x="120" y="200" width="60" height="20" rx="10" stroke="currentColor" strokeWidth="2" fill="none" />
            {/* Stethoscope */}
            <circle cx="100" cy="280" r="8" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M100 272 Q120 250 140 250 Q160 250 180 270" stroke="currentColor" strokeWidth="2" fill="none" />
            <circle cx="180" cy="270" r="6" fill="currentColor" />
          </g>
        </svg>
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center px-12 py-16">
        {/* Logo Section */}
        <div className="mb-12 animate-fade-in">
          <div className="flex items-center mb-6">
            <div className="w-14 h-14 bg-white/95 backdrop-blur-sm rounded-2xl flex items-center justify-center mr-4 shadow-lg">
              <Activity className="h-7 w-7 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">EMR Pro</h1>
              <p className="text-white/80 text-sm font-medium">Healthcare Management</p>
            </div>
          </div>
        </div>

        {/* Main Tagline */}
        <div className="mb-12 animate-slide-up">
          <h2 className="text-5xl font-bold text-white mb-6 leading-tight">
            Accurate billing for
            <span className="block bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              better healthcare
            </span>
          </h2>
          <p className="text-xl text-white/85 leading-relaxed max-w-md">
            Streamline your medical practice with intelligent EMR solutions designed for modern healthcare professionals.
          </p>
        </div>

        {/* Enhanced Features */}
        <div className="space-y-6 animate-fade-in-up">
          <div className="flex items-center text-white/95 group">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mr-4 group-hover:bg-white/30 transition-all duration-300">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="font-semibold block">HIPAA Compliant & Secure</span>
              <span className="text-white/70 text-sm">Enterprise-grade security</span>
            </div>
          </div>
          <div className="flex items-center text-white/95 group">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mr-4 group-hover:bg-white/30 transition-all duration-300">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <span className="font-semibold block">Real-time Patient Data</span>
              <span className="text-white/70 text-sm">Instant access anywhere</span>
            </div>
          </div>
          <div className="flex items-center text-white/95 group">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mr-4 group-hover:bg-white/30 transition-all duration-300">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="font-semibold block">Integrated Workflows</span>
              <span className="text-white/70 text-sm">Seamless clinical operations</span>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 pt-8 border-t border-white/20 animate-fade-in-up">
          <p className="text-white/60 text-sm mb-4 font-medium">Trusted by healthcare professionals nationwide</p>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">99.9%</div>
              <div className="text-white/70 text-xs">Uptime SLA</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">500K+</div>
              <div className="text-white/70 text-xs">Patients Managed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">1000+</div>
              <div className="text-white/70 text-xs">Healthcare Providers</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
