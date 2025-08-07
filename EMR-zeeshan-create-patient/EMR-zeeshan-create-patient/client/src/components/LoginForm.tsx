import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import { useDispatch, useSelector } from "react-redux";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Shield, Activity, Loader2 } from "lucide-react";
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import { Label } from "@/components/UI/label";
import { Checkbox } from "@/components/UI/checkbox";
import { Alert, AlertDescription } from "@/components/UI/alert";
import { Card, CardContent } from "@/components/UI/card";
import { loginUser } from "../redux/slices/authSlice";
import { RootState, AppDispatch } from "../redux/store";
import { useToast } from "@/hooks/use-toast";

// FloatingInput component for beautiful form fields
const FloatingInput = ({ 
  id, 
  type = "text", 
  value, 
  onChange, 
  label, 
  icon: Icon, 
  required = false,
  children 
}: {
  id: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  icon: any;
  required?: boolean;
  children?: React.ReactNode;
}) => {
  const [focused, setFocused] = useState(false);
  const hasValue = value.length > 0;

  return (
    <div className="relative">
      <div className="relative">
        <input
          type={type}
          id={id}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          required={required}
          className={`
            w-full h-14 px-4 pl-12 bg-white dark:bg-gray-800 border-2 rounded-xl
            transition-all duration-300 ease-in-out outline-none
            ${focused || hasValue 
              ? 'border-blue-500 dark:border-blue-400' 
              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
            }
            text-gray-900 dark:text-gray-100 placeholder-transparent
          `}
          placeholder={label}
        />
        
        {/* Icon */}
        <div className={`
          absolute left-4 top-1/2 transform -translate-y-1/2 transition-all duration-300
          ${focused || hasValue ? 'text-blue-500 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}
        `}>
          <Icon className="w-5 h-5" />
        </div>

        {/* Floating Label */}
        <label
          htmlFor={id}
          className={`
            absolute left-12 transition-all duration-300 ease-in-out pointer-events-none
            ${focused || hasValue
              ? 'top-2 text-xs font-medium text-blue-600 dark:text-blue-400'
              : 'top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400'
            }
          `}
        >
          {label}
        </label>

        {/* Additional elements (like password toggle) */}
        {children}
      </div>
    </div>
  );
};

export const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  const { toast } = useToast();

  // Show toast notifications for login status
  useEffect(() => {
    if (error) {
      toast({
        title: "Sign In Failed",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const result = await dispatch(loginUser({ email, password, rememberMe }));
      if (loginUser.fulfilled.match(result)) {
        toast({
          title: "Welcome back!",
          description: "Successfully signed in to your EMR account.",
        });
      }
    } catch (err) {
      // Error handled by Redux and useEffect
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="mx-auto w-full max-w-md">
        
        {/* Mobile Logo */}
        <div className="lg:hidden text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl flex items-center justify-center mr-3">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">EMR Pro</h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Healthcare Management</p>
            </div>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 animate-slide-up backdrop-blur-sm">
          {/* Form Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
              Welcome Back
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Sign in to access your EMR dashboard
            </p>
          </div>

          {/* Login Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {/* Email Field */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <FloatingInput
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                label="Email Address"
                icon={Mail}
                required
              />
            </div>

            {/* Password Field */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <FloatingInput
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                label="Password"
                icon={Lock}
                required
              >
                <button 
                  type="button" 
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </FloatingInput>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center space-x-3">
                <Checkbox 
                  id="rememberMe"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
                <Label htmlFor="rememberMe" className="text-gray-700 dark:text-gray-300 font-medium cursor-pointer">
                  Remember me
                </Label>
              </div>
              <Link 
                href="/forgot-password" 
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold text-sm transition-all duration-200 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            {/* Sign In Button */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <Button 
                type="submit" 
                className="w-full h-14 bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                disabled={loading || isSubmitting}
              >
                {loading || isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Signing In...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Security Badge */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <div className="flex items-center justify-center space-x-2 text-gray-500 dark:text-gray-400">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">HIPAA Compliant & SOC 2 Certified</span>
            </div>
          </div>
        </div>

        {/* Emergency Access Card */}
        <div className="mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <div className="flex items-start">
            <div className="w-6 h-6 text-red-500 dark:text-red-400 mt-0.5 mr-3">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-red-800 dark:text-red-300">Emergency Access</h4>
              <p className="text-xs text-red-700 dark:text-red-400 mt-1">
                For urgent patient care requiring immediate access, contact your system administrator
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
