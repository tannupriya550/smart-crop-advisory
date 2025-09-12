import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/hooks/use-language";
import { Header } from "@/components/header";
import { BottomNav } from "@/components/bottom-nav";

import Home from "@/pages/home";
import Profile from "@/pages/profile";
import Recommendations from "@/pages/recommendations";
import Calculator from "@/pages/calculator";
import PestGallery from "@/pages/pest-gallery";
import Chat from "@/pages/chat";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/profile" component={Profile} />
      <Route path="/recommendations" component={Recommendations} />
      <Route path="/calculator" component={Calculator} />
      <Route path="/pest-gallery" component={PestGallery} />
      <Route path="/chat" component={Chat} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <div className="min-h-screen bg-background">
            <Header farmerName="रामेश कुमार" />
            <main className="pb-20 lg:pb-6">
              <Router />
            </main>
            <BottomNav />
            <Toaster />
          </div>
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
