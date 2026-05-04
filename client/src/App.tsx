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
import Home from "./pages/Home";
import ChatAssistant from "./pages/ChatAssistant";
import TwoFactorVerification from "./pages/TwoFactorVerification";
import UserIntegrationsSettings from "./pages/UserIntegrationsSettings";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard/chat" component={ChatAssistant} />
      <Route path="/auth/2fa" component={TwoFactorVerification} />
      <Route path="/settings/integrations" component={UserIntegrationsSettings} />
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
