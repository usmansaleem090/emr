import React from "react";
import { LoginBranding } from "../components/LoginBranding";
import { LoginForm } from "../components/LoginForm";
import { Toaster } from "@/components/UI/toaster";

const LoginPage = () => {
  return (
    <>
      <div className="min-h-screen flex overflow-hidden">
        <LoginBranding />
        <LoginForm />
      </div>
      <Toaster />
    </>
  );
};

export default LoginPage;
