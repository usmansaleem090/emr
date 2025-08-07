import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/UI/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/UI/form";
import { Input } from "@/components/UI/input";
import { Button } from "@/components/UI/button";
import { Alert, AlertDescription } from "@/components/UI/alert";
import { ArrowLeft, Lock, Loader2, CheckCircle } from "lucide-react";
import { apiClient } from "@/utils/apiClient";
import { resetPasswordSchema, type ResetPasswordRequest } from "@shared/schema";
import { LoginBranding } from "@/components/LoginBranding";

export default function ResetPasswordPage() {
  const [location] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [token, setToken] = useState<string>('');

  const form = useForm<ResetPasswordRequest>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Extract token from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
      form.setValue('token', tokenParam);
    }
  }, [form]);

  const onSubmit = async (data: ResetPasswordRequest) => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await apiClient.post('/auth/reset-password', data);
      
      if (response.data.success) {
        setMessage({
          type: 'success',
          text: response.data.message
        });
        form.reset();
      } else {
        setMessage({
          type: 'error',
          text: response.data.message || 'An error occurred. Please try again.'
        });
      }
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Network error. Please check your connection and try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-teal-50 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="w-full max-w-md space-y-6">
          <LoginBranding />
          <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
                <AlertDescription className="text-red-800 dark:text-red-200">
                  Invalid or missing reset token. Please check your email for the correct reset link.
                </AlertDescription>
              </Alert>
              <div className="mt-4 text-center">
                <Link href="/forgot-password">
                  <Button variant="outline">Request New Reset Link</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-teal-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Branding */}
        <LoginBranding />

        {/* Reset Password Form */}
        <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              Set New Password
            </CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              Enter your new password below
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {message && (
              <Alert className={message.type === 'success' ? 'border-green-200 bg-green-50 dark:bg-green-900/20' : 'border-red-200 bg-red-50 dark:bg-red-900/20'}>
                {message.type === 'success' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <Lock className="h-4 w-4" />
                )}
                <AlertDescription className={message.type === 'success' ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}>
                  {message.text}
                </AlertDescription>
              </Alert>
            )}

            {message?.type === 'success' ? (
              <div className="text-center space-y-4">
                <div className="text-green-600 dark:text-green-400">
                  <CheckCircle className="mx-auto h-12 w-12 mb-2" />
                  <p className="font-medium">Password Reset Successfully!</p>
                </div>
                <Link href="/login">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white">
                    Continue to Login
                  </Button>
                </Link>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 dark:text-gray-300">New Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter your new password"
                            className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 dark:text-gray-300">Confirm Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Confirm your new password"
                            className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating Password...
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        Update Password
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            )}

            <div className="text-center space-y-2">
              <Link href="/login">
                <Button variant="ghost" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}