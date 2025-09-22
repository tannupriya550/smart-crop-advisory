// client/src/App.tsx
import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/hooks/use-language";
import { Header } from "@/components/header";
import { BottomNav } from "@/components/bottom-nav";

// ✅ Pages
import Home from "@/pages/home";
import Profile from "@/pages/profile";
import Recommendations from "@/pages/recommendations";
import Calculator from "@/pages/calculator";
import PestGallery from "@/pages/pest-gallery";
import Chat from "@/pages/chat";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import Detect from "@/pages/detect"; // 👈 Ensure the file is `Detect.tsx` (capital D)

// 🔑 Auth helper
function isAuthenticated() {
  return !!localStorage.getItem("token");
}

// 🔒 Protected Route wrapper
function PrivateRoute({ component: Component, ...rest }: any) {
  if (!isAuthenticated()) {
    return <Redirect to="/login" />;
  }
  return <Component {...rest} />;
}

// 🌐 Router setup
function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />

      {/* Protected routes */}
      <Route
        path="/"
        component={() =>
          isAuthenticated() ? <Home /> : <Redirect to="/login" />
        }
      />
      <Route
        path="/profile"
        component={() => <PrivateRoute component={Profile} />}
      />
      <Route
        path="/recommendations"
        component={() => <PrivateRoute component={Recommendations} />}
      />
      <Route
        path="/calculator"
        component={() => <PrivateRoute component={Calculator} />}
      />
      <Route
        path="/pest-gallery"
        component={() => <PrivateRoute component={PestGallery} />}
      />
      <Route
        path="/chat"
        component={() => <PrivateRoute component={Chat} />}
      />
      <Route
        path="/detect"
        component={() => <PrivateRoute component={Detect} />}
      />

      {/* Catch-all */}
      <Route component={NotFound} />
    </Switch>
  );
}

// 🌱 App wrapper
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <div className="min-h-screen bg-background">
            {/* Show Header/BottomNav only if logged in */}
            {isAuthenticated() && <Header farmerName="रामेश कुमार" />}
            <main className="pb-20 lg:pb-6">
              <Router />
            </main>
            {isAuthenticated() && <BottomNav />}
            <Toaster />
          </div>
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
