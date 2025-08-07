import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/UI/button";
import { Card, CardContent } from "@/components/UI/card";
import {
  ChevronLeft,
  ChevronRight,
  Stethoscope,
  Users,
  Calendar,
  FileText,
  Shield,
  Heart,
  Activity,
  CheckCircle,
  Star,
  ArrowRight,
  User,
  Baby,
  Eye,
  Brain,
  Microscope,
  Pill,
  HeartHandshake,
  UserCheck,
  Clock,
  FileHeart,
} from "lucide-react";

const slides = [
  {
    id: 1,
    title: "Advanced Electronic Medical Records",
    subtitle: "Streamline Your Healthcare Practice",
    description: "Comprehensive EMR solution designed for modern healthcare providers. Manage patients, appointments, and medical records with ease.",
    image: "bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800",
    icon: <Stethoscope className="w-16 h-16 text-white mb-4" />,
    features: ["HIPAA Compliant", "Cloud-Based", "Real-time Updates"],
    illustrations: (
      <div className="absolute right-10 top-1/2 transform -translate-y-1/2 hidden lg:block">
        <div className="relative">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 space-y-4">
            <div className="flex items-center space-x-4">
              <User className="w-12 h-12 text-white" />
              <div className="text-white">
                <div className="font-semibold">Dr. Sarah Johnson</div>
                <div className="text-sm opacity-80">Cardiologist</div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <UserCheck className="w-12 h-12 text-white" />
              <div className="text-white">
                <div className="font-semibold">Patient: John Doe</div>
                <div className="text-sm opacity-80">Last Visit: Today</div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <FileHeart className="w-12 h-12 text-white" />
              <div className="text-white">
                <div className="font-semibold">Medical Record</div>
                <div className="text-sm opacity-80">Updated: 2 mins ago</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 2,
    title: "Multi-Location Clinic Management",
    subtitle: "Scale Your Practice Effortlessly",
    description: "Manage multiple clinic locations, staff, and resources from a single unified platform with advanced role-based permissions.",
    image: "bg-gradient-to-br from-green-600 via-green-700 to-green-800",
    icon: <Users className="w-16 h-16 text-white mb-4" />,
    features: ["Multi-Location Support", "Staff Management", "Role-Based Access"],
    illustrations: (
      <div className="absolute right-10 top-1/2 transform -translate-y-1/2 hidden lg:block">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <User className="w-8 h-8 text-white mx-auto mb-2" />
            <div className="text-white text-sm font-medium">Dr. Smith</div>
            <div className="text-white/70 text-xs">Main Clinic</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <User className="w-8 h-8 text-white mx-auto mb-2" />
            <div className="text-white text-sm font-medium">Dr. Johnson</div>
            <div className="text-white/70 text-xs">Downtown</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <Users className="w-8 h-8 text-white mx-auto mb-2" />
            <div className="text-white text-sm font-medium">15 Staff</div>
            <div className="text-white/70 text-xs">Total Team</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <Heart className="w-8 h-8 text-white mx-auto mb-2" />
            <div className="text-white text-sm font-medium">248 Patients</div>
            <div className="text-white/70 text-xs">Active Care</div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 3,
    title: "Smart Appointment Scheduling",
    subtitle: "Optimize Your Time & Resources",
    description: "Intelligent scheduling system with automated reminders, conflict detection, and seamless patient communication.",
    image: "bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800",
    icon: <Calendar className="w-16 h-16 text-white mb-4" />,
    features: ["Smart Scheduling", "Automated Reminders", "Conflict Detection"],
    illustrations: (
      <div className="absolute right-10 top-1/2 transform -translate-y-1/2 hidden lg:block">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
          <div className="text-white font-semibold mb-4">Today's Schedule</div>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Clock className="w-6 h-6 text-white" />
              <div>
                <div className="text-white text-sm font-medium">9:00 AM - Maria Garcia</div>
                <div className="text-white/70 text-xs">Routine Checkup</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="w-6 h-6 text-white" />
              <div>
                <div className="text-white text-sm font-medium">10:30 AM - James Wilson</div>
                <div className="text-white/70 text-xs">Follow-up Visit</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="w-6 h-6 text-white" />
              <div>
                <div className="text-white text-sm font-medium">2:00 PM - Sarah Brown</div>
                <div className="text-white/70 text-xs">Consultation</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 4,
    title: "Comprehensive Document Management",
    subtitle: "Secure & Organized Records",
    description: "Advanced document management with secure file storage, easy retrieval, and complete audit trails for all medical records.",
    image: "bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800",
    icon: <FileText className="w-16 h-16 text-white mb-4" />,
    features: ["Secure Storage", "Easy Retrieval", "Audit Trails"],
    illustrations: (
      <div className="absolute right-10 top-1/2 transform -translate-y-1/2 hidden lg:block">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
          <div className="text-white font-semibold mb-4">Patient Documents</div>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <FileText className="w-6 h-6 text-white" />
              <div>
                <div className="text-white text-sm font-medium">Lab Results.pdf</div>
                <div className="text-white/70 text-xs">Updated 1 hour ago</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <FileHeart className="w-6 h-6 text-white" />
              <div>
                <div className="text-white text-sm font-medium">Medical History.pdf</div>
                <div className="text-white/70 text-xs">Updated yesterday</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Microscope className="w-6 h-6 text-white" />
              <div>
                <div className="text-white text-sm font-medium">X-Ray Images.jpg</div>
                <div className="text-white/70 text-xs">Updated 2 days ago</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
];

const features = [
  {
    icon: <Shield className="w-12 h-12 text-blue-600" />,
    title: "HIPAA Compliant Security",
    description: "Enterprise-grade security with end-to-end encryption and comprehensive audit trails for all patient data.",
    patientInfo: "Protecting 10,000+ patient records daily"
  },
  {
    icon: <Heart className="w-12 h-12 text-red-500" />,
    title: "Patient-Centered Care",
    description: "Streamline patient interactions with intuitive interfaces and comprehensive health records management.",
    patientInfo: "Serving patients across all age groups and specialties"
  },
  {
    icon: <Activity className="w-12 h-12 text-green-600" />,
    title: "Real-Time Analytics",
    description: "Make data-driven decisions with comprehensive reporting and real-time practice insights for better patient outcomes.",
    patientInfo: "Analyzing trends for improved care delivery"
  }
];

const testimonials = [
  {
    name: "Dr. Sarah Johnson",
    role: "Family Medicine Physician",
    content: "This EMR system has transformed our practice. The intuitive interface and comprehensive features make patient care more efficient. Our patient satisfaction scores have increased by 40%.",
    rating: 5,
    avatar: <User className="w-12 h-12 text-blue-600" />,
    patients: "Managing 450+ patients"
  },
  {
    name: "Michael Chen",
    role: "Clinic Administrator",
    content: "Managing multiple locations has never been easier. The role-based permissions and centralized management are game-changers. We've reduced administrative overhead by 60%.",
    rating: 5,
    avatar: <Users className="w-12 h-12 text-green-600" />,
    patients: "Overseeing 3 clinic locations"
  },
  {
    name: "Dr. Maria Rodriguez",
    role: "Pediatrician",
    content: "The appointment scheduling and document management features have significantly improved our workflow and patient satisfaction. Parents love the streamlined experience.",
    rating: 5,
    avatar: <Baby className="w-12 h-12 text-pink-600" />,
    patients: "Caring for 200+ young patients"
  }
];

export default function LandingPage() {
  const [, setLocation] = useLocation();
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const handleProceed = () => {
    setLocation("/login");
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Stethoscope className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">MedFlow EMR</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Advanced Healthcare Management</p>
              </div>
            </div>
            <Button onClick={handleProceed} className="bg-blue-600 hover:bg-blue-700">
              Get Started
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Slider Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className={`w-full h-full ${slide.image} flex items-center justify-center relative overflow-hidden`}>
              {slide.illustrations}
              <div className="container mx-auto px-6 text-center text-white relative z-10">
                <div className="max-w-4xl mx-auto">
                  <div className="flex justify-center mb-6">
                    {slide.icon}
                  </div>
                  <h2 className="text-5xl md:text-6xl font-bold mb-4 leading-tight">
                    {slide.title}
                  </h2>
                  <h3 className="text-2xl md:text-3xl font-light mb-6 text-blue-100">
                    {slide.subtitle}
                  </h3>
                  <p className="text-xl mb-8 text-blue-50 max-w-3xl mx-auto leading-relaxed">
                    {slide.description}
                  </p>
                  
                  {/* Features */}
                  <div className="flex flex-wrap justify-center gap-4 mb-12">
                    {slide.features.map((feature, idx) => (
                      <div key={idx} className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3">
                        <span className="text-white font-medium flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Proceed Button */}
                  <Button
                    onClick={handleProceed}
                    size="lg"
                    className="bg-white text-blue-600 hover:bg-blue-50 text-xl px-12 py-4 rounded-full font-semibold shadow-2xl transform hover:scale-105 transition-all duration-300"
                  >
                    Proceed to Login
                    <ArrowRight className="w-6 h-6 ml-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-4 h-4 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "bg-white scale-125"
                  : "bg-white/50 hover:bg-white/75"
              }`}
            />
          ))}
        </div>
      </section>

      {/* Medical Specialties Showcase */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Supporting All Medical Specialties
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Trusted by healthcare professionals across diverse medical fields
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
            {[
              { icon: <Heart className="w-8 h-8" />, name: "Cardiology", color: "text-red-500" },
              { icon: <Brain className="w-8 h-8" />, name: "Neurology", color: "text-purple-500" },
              { icon: <Baby className="w-8 h-8" />, name: "Pediatrics", color: "text-pink-500" },
              { icon: <Eye className="w-8 h-8" />, name: "Ophthalmology", color: "text-blue-500" },
              { icon: <Microscope className="w-8 h-8" />, name: "Laboratory", color: "text-green-500" },
              { icon: <Pill className="w-8 h-8" />, name: "Pharmacy", color: "text-orange-500" },
              { icon: <User className="w-8 h-8" />, name: "General Practice", color: "text-teal-500" },
              { icon: <HeartHandshake className="w-8 h-8" />, name: "Emergency", color: "text-red-600" },
            ].map((specialty, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className={`flex justify-center mb-3 ${specialty.color}`}>
                  {specialty.icon}
                </div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {specialty.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose MedFlow EMR?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Built specifically for healthcare providers who demand excellence, security, and efficiency in their practice management.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center p-8 hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                    {feature.description}
                  </p>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                    <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                      {feature.patientInfo}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              What Healthcare Professionals Say
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Trusted by thousands of healthcare providers worldwide
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardContent className="pt-0">
                  <div className="flex items-center mb-4">
                    <div className="mr-4">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {testimonial.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-4 italic leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                    <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                      {testimonial.patients}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Practice?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Join thousands of healthcare providers who have already improved their patient care and operational efficiency with MedFlow EMR.
          </p>
          <Button
            onClick={handleProceed}
            size="lg"
            className="bg-white text-blue-600 hover:bg-blue-50 text-xl px-12 py-4 rounded-full font-semibold shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            Start Your Journey
            <ArrowRight className="w-6 h-6 ml-3" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">MedFlow EMR</h3>
                <p className="text-sm text-gray-400">Advanced Healthcare Management</p>
              </div>
            </div>
            <div className="text-sm text-gray-400">
              © 2025 MedFlow EMR. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}