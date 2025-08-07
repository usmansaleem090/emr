import React, { Suspense, useEffect } from "react";
import { Route, Switch } from "wouter";
import { Provider } from "react-redux";

import { store } from "./redux/store";
import { useAppSelector, useAppDispatch } from "./redux/store";
import { verifyToken } from "./redux/slices/authSlice";
import { Toaster } from "@/components/UI/toaster";
import { TooltipProvider } from "@/components/UI/tooltip";
import { ThemeProvider } from "./context/ThemeContext";
import { LocationProvider } from "./context/LocationContext";
import { DashboardLayout } from "./components/Layout/DashboardLayout";
import { LoadingSpinner } from "./components/UI/LoadingSpinner";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { ROUTES, getFlattenedRoutes } from "./constants/routes";

// Lazy load components for public routes
const LandingPage = React.lazy(() => import("@/pages/LandingPage"));
const LoginPage = React.lazy(() => import("@/pages/LoginPage"));
const ForgotPasswordPage = React.lazy(() => import("@/pages/ForgotPasswordPage"));
const ResetPasswordPage = React.lazy(() => import("@/pages/ResetPasswordPage"));
const NotFound = React.lazy(() => import("@/pages/not-found"));

function AppContent() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, loading, user } = useAppSelector((state: any) => state.auth);



  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token && (!isAuthenticated || !user)) {
      dispatch(verifyToken());
    }
  }, [dispatch, isAuthenticated, user]);

  // Show loading spinner while verifying token
  if (loading) {
    return <LoadingSpinner />;
  }

  // Check if we have a token but are not authenticated yet (still verifying)
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  if (token && !isAuthenticated) {
    return <LoadingSpinner message="Verifying authentication..." />;
  }

  if (!isAuthenticated) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <Switch>
          <Route path="/" component={LandingPage} />
          <Route path="/login" component={LoginPage} />
          <Route path="/forgot-password" component={ForgotPasswordPage} />
          <Route path="/reset-password" component={ResetPasswordPage} />
          <Route component={LandingPage} />
        </Switch>
      </Suspense>
    );
  }

  // Get all routes (including children) for routing
  const allRoutes = getFlattenedRoutes(ROUTES);

  return (
    <LocationProvider>
      <DashboardLayout>
        <Suspense fallback={<LoadingSpinner />}>
          <Switch>
            {/* Public routes */}
            <Route path="/" component={LandingPage} />
            <Route path="/login" component={LoginPage} />
            <Route path="/forgot-password" component={ForgotPasswordPage} />
            <Route path="/reset-password" component={ResetPasswordPage} />

            {/* Protected routes from routes array */}
            {allRoutes.map((route) => (
              <Route key={route.path} path={route.path}>
                {route.isProtected ? (
                  <ProtectedRoute requiredPath={route.path}>
                    <route.component />
                  </ProtectedRoute>
                ) : (
                  <route.component />
                )}
              </Route>
            ))}

            {/* 404 */}
            <Route component={NotFound} />
          </Switch>
        </Suspense>
      </DashboardLayout>
    </LocationProvider>
  );
}

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <TooltipProvider>
          <AppContent />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
