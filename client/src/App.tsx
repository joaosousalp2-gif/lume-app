/*
 * App — Lume
 * Tema: dark (fundo escuro/azul, textos claros — modo noturno por padrão, com toggle para light)
 */

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { TabsProvider } from "./contexts/TabsContext";
import { lazy, Suspense } from "react";

const Home = lazy(() => import("./pages/Home"));
const ChatAssistant = lazy(() => import("./pages/ChatAssistant"));
const TwoFactorVerification = lazy(() => import("./pages/TwoFactorVerification"));
const FeedbackAnalytics = lazy(() => import("./pages/FeedbackAnalytics"));

function RouteFallback() {
  return <div className="flex min-h-[40vh] items-center justify-center text-slate-400">Carregando...</div>;
}

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/">
        {() => <Suspense fallback={<RouteFallback />}><Home /></Suspense>}
      </Route>
      <Route path="/dashboard/chat">
        {() => <Suspense fallback={<RouteFallback />}><ChatAssistant /></Suspense>}
      </Route>
      <Route path="/dashboard/feedback">
        {() => <Suspense fallback={<RouteFallback />}><FeedbackAnalytics /></Suspense>}
      </Route>
      <Route path="/auth/2fa">
        {() => <Suspense fallback={<RouteFallback />}><TwoFactorVerification /></Suspense>}
      </Route>
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TabsProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </TabsProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
