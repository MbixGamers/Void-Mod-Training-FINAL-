import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Home from "@/pages/home";
import TestPage from "@/pages/test";
import AdminPage from "@/pages/admin";
import SuccessPage from "@/pages/success";
import NotFound from "@/pages/not-found";

import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

function Router() {
  const { toast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    if (error === "active_session") {
      toast({
        title: "Session Error",
        description: "You are already logged in from another device. Please log out there first.",
        variant: "destructive",
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (error === "auth_failed") {
      toast({
        title: "Login Failed",
        description: "Discord authentication failed. Please try again.",
        variant: "destructive",
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [toast]);

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/test" component={TestPage} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/success" component={SuccessPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
